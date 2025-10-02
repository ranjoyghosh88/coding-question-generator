Here is an updated README you can drop into `code-sample-gen-local/README.md`.

---

Coding Sample Generator – Local First (Node + React + AWS ready)

What this app does

1. Shows a coding question with solutions side by side.
2. Language dropdown: JavaScript, TypeScript, Python, Java.
3. Refresh button to generate a new sample question and answers.
4. History of generated questions is preserved locally in the browser.
5. JavaScript and TypeScript answers are executable with a Run button and real output.

Tech stack

* API: Node.js, Express, TypeScript
* Client: Next.js, React, TypeScript
* Sandbox: vm2 for safe server side execution of JavaScript and TypeScript
* Shared: question library and generators in a shared workspace package
* Optional AWS: you can later back server history with Amazon DynamoDB, not required for local run

Prerequisites

* Node.js 20 LTS recommended
* pnpm package manager

  * best: corepack enable && corepack prepare pnpm@latest --activate
  * or: npm install -g pnpm --location=global

Important note on Node.js versions

* Node 22 can break vm2 based execution. Use Node 20 LTS for local dev.
  nvm install 20
  nvm use 20
  node -v

Clone or unzip

* unzip the archive and open the folder in a terminal
* cd code-sample-gen-local

Environment

* copy the example file and adjust if you change ports
  cp .env.example .env
  default values
  PORT=4010
  NEXT_PUBLIC_API_BASE=[http://localhost:4010](http://localhost:4010)

Install dependencies
pnpm install

First time fix for web config newlines
If you see an error about “Invalid or unexpected token” in next.config.js, your file has literal \n characters. Replace both files exactly as below.

1. apps/web/next.config.js
   cat > apps/web/next.config.js <<'EOF'
   /** @type {import('next').NextConfig} */
   const nextConfig = {};
   module.exports = nextConfig;
   EOF
2. apps/web/next-env.d.ts
   cat > apps/web/next-env.d.ts <<'EOF'
   /// <reference types="next" />
   /// <reference types="next/image-types/global" />
   EOF

First time build of the shared package
The API imports @cs/shared. Build it once so the dist exists.
pnpm --filter @cs/shared build

Run the API alone to verify
pnpm --filter @cs/api dev
you should see: API listening on [http://localhost:4010](http://localhost:4010)
stop with Ctrl+C

Run the full stack
pnpm dev
web at [http://localhost:3000](http://localhost:3000)
api at [http://localhost:4010](http://localhost:4010)

Using the app

* open [http://localhost:3000](http://localhost:3000)
* pick a language
* click Generate or Refresh
* review the problem and multiple solutions side by side
* for JavaScript or TypeScript click Run to execute the solution on sample input and see output
* history persists in your browser; click View in history to reopen any item

Ports and configuration

* API port is taken from PORT in .env
* web uses NEXT_PUBLIC_API_BASE to call the API
* if you change PORT, also change apps/web/.env.local to match
  echo "NEXT_PUBLIC_API_BASE=[http://localhost:4015](http://localhost:4015)" > apps/web/.env.local

Optional Amazon Web Services notes (not required to run locally)

* later, if you want server side history persistence, create a DynamoDB table with partition key userId and sort key createdAt
* set AWS_REGION and DDB_TABLE in .env
* extend the API to write and read history from DynamoDB; the current project is structured to make that addition straightforward

Security model for local run

* the /run endpoint executes JavaScript and TypeScript in a vm2 sandbox with one second timeout, no file or network access, and no external requires
* inputs are validated with Zod
* do not send secrets to /run and do not log sensitive data

Troubleshooting quick checks

1. pnpm not found
   corepack enable && corepack prepare pnpm@latest --activate
   or npm install -g pnpm --location=global

2. back end not running or vm2 errors
   use Node 20 LTS
   nvm use 20

3. cannot import @cs/shared
   build it once
   pnpm --filter @cs/shared build

4. web fails with SyntaxError in next.config.js
   replace apps/web/next.config.js and apps/web/next-env.d.ts as shown above

5. port already in use
   change PORT in .env and update apps/web/.env.local to match

6. run output missing
   only JavaScript and TypeScript solutions are executable in this starter. Python and Java are shown but not executed to keep the local setup simple.

Scripts reference

* root
  pnpm dev        run api and web in parallel
  pnpm build      build all workspace packages
  pnpm -r typecheck

* api only
  pnpm --filter @cs/api dev

* shared only
  pnpm --filter @cs/shared build

What to extend next

* enrich the question library with more small, runnable samples
* add difficulty levels and tags with filtering
* persist server side history with DynamoDB and a simple user identifier
* add basic authentication with JSON Web Token and rate limiting on the API
* export a question and its solutions to markdown or portable document format for interview prep


use Node twenty long term support
vm2 does not play nicely with Node twenty two. Switch to Node twenty and retry.

nvm install 20
nvm use 20
node -v   # should show v20.x


build the shared package before starting the api
The api imports @cs/shared, but its dist is not built yet.

cd code-sample-gen-local
pnpm --filter @cs/shared build
pnpm --filter @cs/api dev


You should see “API listening on http://localhost:4010”
.

If you want one command forever, add a dev script to @cs/shared so it auto builds while you code.

Run these patches:

# add a dev script to @cs/shared
jq '.scripts.dev="tsc -w -p tsconfig.json"' packages/shared/package.json > /tmp/pkg && mv /tmp/pkg packages/shared/package.json

# make root dev run shared, api and web together
jq '.scripts.dev="pnpm -r --parallel dev"' package.json > /tmp/root && mv /tmp/root package.json


Then:

pnpm install
pnpm dev


Still not starting

port already used
Change the api port:

echo "PORT=4015" >> .env
echo "NEXT_PUBLIC_API_BASE=http://localhost:4015" > apps/web/.env.local
pnpm dev


module resolution complaint about @cs/shared
Point the package to its source during dev:

# temporary dev-only tweak
jq '.main="src/index.ts" | .types="src/index.ts"' packages/shared/package.json > /tmp/pkg && mv /tmp/pkg packages/shared/package.json
pnpm dev


show me the exact api error text
If it still fails, run:

pnpm --filter @cs/api dev
