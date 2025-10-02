import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { z } from 'zod';
import { SupportedLanguage, generate, generateMany } from '@cs/shared';
import { NodeVM } from 'vm2';

const app = express();
app.use(express.json({ limit: '200kb' }));
app.use(cors({ origin: '*' }));
app.use(helmet());
app.use(morgan('tiny'));

const PORT = Number(process.env.PORT || 4010);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/languages', (_req, res) => res.json({ languages: SupportedLanguage.options }));

const GenBody = z.object({
  language: SupportedLanguage,
  count: z.number().int().min(1).max(20).optional()
});

app.post('/generate', (req, res) => {
  const parsed = GenBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const { language, count } = parsed.data;

  if (count && count > 1) {
    const list = generateMany(language, count);
    return res.json({ items: list });
  }
  const one = generate(language);
  return res.json(one);
});

// Execute runnable JavaScript or TypeScript
const RunBody = z.object({
  code: z.string(),
  language: z.enum(['javascript','typescript']),
  runnerInput: z.any(),
});

app.post('/run', async (req, res) => {
  const parsed = RunBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const { code, language, runnerInput } = parsed.data;

  try {
    const vm = new NodeVM({
      console: 'redirect',
      sandbox: {},
      timeout: 1000,
      eval: false,
      wasm: false,
      require: { external: false, builtin: [] }
    });

    let userCode = code;
    if (language === 'typescript') {
      userCode = code
        .replace(/: *[A-Za-z_\\[\\]\\<\\>\\|\\?\\s,]+/g, '')
        .replace(/interface [\\s\\S]*?\\{[\\s\\S]*?\\}/g, '');
    }

    const wrapper = `
      const globalOut = [];
      const console = { log: (...args) => globalOut.push(args.join(' ')) };
      ${userCode}
      module.exports = async function(runInput){
        const { nums, target, s, call } = runInput || {};
        // eslint-disable-next-line no-eval
        const result = eval(call);
        return { result, logs: globalOut };
      };
    `;

    const runner = vm.run(wrapper, 'sandbox.js');
    const output = await runner(runnerInput);
    res.json({ ok: true, output });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: String(e.message || e) });
  }
});

app.listen(PORT, () => console.log(`API listening on http://
