import { z } from 'zod';

export const SupportedLanguage = z.enum(['javascript','typescript','python','java']);
export type SupportedLanguage = z.infer<typeof SupportedLanguage>;

export interface Solution {
  id: string;
  title: string;
  code: string;
  approach: string;
  timeComplexity: string;
  spaceComplexity: string;
  runnable?: boolean;
  runnerInput?: any;
}

export interface QuestionPayload {
  id: string;
  language: SupportedLanguage;
  title: string;
  prompt: string;
  solutions: Solution[];
  tags: string[];
  createdAt: string;
}

export function uid(){ return Math.random().toString(36).slice(2,10); }

// Library with runnable JavaScript and TypeScript solutions
export const Library = {
  "two-sum": {
    title: "Two Sum",
    prompt: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    tags: ["array", "hash-map"],
    code: {
      javascript: [{
        title: "HashMap One Pass",
        code: `function twoSum(nums, target){
  const map = new Map();
  for (let i = 0; i < nums.length; i++){
    const need = target - nums[i];
    if (map.has(need)) return [map.get(need), i];
    map.set(nums[i], i);
  }
  return [-1,-1];
}`,
        approach: "One scan using Map for complement lookup.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        runnable: true,
        runnerInput: { nums: [2,7,11,15], target: 9, call: "twoSum(nums, target)" }
      },{
        title: "Brute Force",
        code: `function twoSum(nums, target){
  for (let i=0;i<nums.length;i++){
    for (let j=i+1;j<nums.length;j++){
      if (nums[i] + nums[j] === target) return [i,j];
    }
  }
  return [-1,-1];
}`,
        approach: "Double loop check.",
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(1)",
        runnable: true,
        runnerInput: { nums: [3,2,4], target: 6, call: "twoSum(nums, target)" }
      }],
      typescript: [{
        title: "HashMap One Pass",
        code: `export function twoSum(nums: number[], target: number): [number, number]{
  const map = new Map<number, number>();
  for (let i=0;i<nums.length;i++){
    const need = target - nums[i];
    if (map.has(need)) return [map.get(need)!, i];
    map.set(nums[i], i);
  }
  return [-1,-1];
}`,
        approach: "Typed Map for complement lookup.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        runnable: true,
        runnerInput: { nums: [1,5,3,7], target: 8, call: "twoSum(nums, target)" }
      }],
      python: [{
        title: "HashMap One Pass",
        code: "def two_sum(nums, target):\n    seen = {}\n    for i,x in enumerate(nums):\n        need = target - x\n        if need in seen: return [seen[need], i]\n        seen[x] = i\n    return [-1,-1]",
        approach: "Dictionary lookup in one pass.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)"
      }],
      java: [{
        title: "HashMap One Pass",
        code: "import java.util.*;\nclass Solution {\n  public int[] twoSum(int[] nums, int target){\n    Map<Integer,Integer> m = new HashMap<>();\n    for (int i=0;i<nums.length;i++){\n      int need = target - nums[i];\n      if (m.containsKey(need)) return new int[]{ m.get(need), i };\n      m.put(nums[i], i);\n    }\n    return new int[]{-1,-1};\n  }\n}",
        approach: "HashMap complement lookup.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)"
      }]
    }
  },
  "valid-parentheses": {
    title: "Valid Parentheses",
    prompt: "Given a string s containing brackets '()[]{}', determine if the string is valid.",
    tags: ["stack","string"],
    code: {
      javascript: [{
        title: "Stack",
        code: `function isValid(s){
  const map = new Map([[")","("],["]","["],["}","{"]]);
  const st = [];
  for (const ch of s){
    if (map.has(ch)){
      if (!st.length || st.pop() !== map.get(ch)) return false;
    } else st.push(ch);
  }
  return st.length === 0;
}`,
        approach: "Use stack to match pairs.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        runnable: true,
        runnerInput: { s: "()[]{}", call: "isValid(s)" }
      }],
      typescript: [{
        title: "Stack",
        code: `export function isValid(s: string): boolean{
  const map = new Map<string,string>([[")","("],["]","["],["}","{"]]);
  const st: string[] = [];
  for (const ch of s){
    if (map.has(ch)){
      if (!st.length || st.pop() !== map.get(ch)) return false;
    } else st.push(ch);
  }
  return st.length === 0;
}`,
        approach: "Typed stack approach.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        runnable: true,
        runnerInput: { s: "([{}])", call: "isValid(s)" }
      }],
      python: [{
        title: "Stack",
        code: "def is_valid(s):\n    pairs={')':'(',']':'[','}':'{'}\n    st=[]\n    for ch in s:\n        if ch in pairs:\n            if not st or st.pop()!=pairs[ch]:\n                return False\n        else:\n            st.append(ch)\n    return len(st)==0",
        approach: "List as stack.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)"
      }],
      java: [{
        title: "Stack",
        code: "import java.util.*;\nclass Solution {\n  public boolean isValid(String s){\n    Map<Character,Character> m = Map.of(')', '(', ']', '[', '}', '{');\n    Deque<Character> st = new ArrayDeque<>();\n    for (char c: s.toCharArray()){\n      if (m.containsKey(c)){\n        if (st.isEmpty() || st.removeLast()!=m.get(c)) return false;\n      } else st.addLast(c);\n    }\n    return st.isEmpty();\n  }\n}",
        approach: "Deque as stack.",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)"
      }]
    }
  }
} as const;

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generate(language: SupportedLanguage): QuestionPayload {
  const keys = Object.keys(Library) as (keyof typeof Library)[];
  const k = pick(keys);
  const meta = Library[k];
  const sols = (meta.code as any)[language] || [];
  return {
    id: uid(),
    language,
    title: meta.title,
    prompt: meta.prompt,
    solutions: sols.map((s: any) => ({
      id: uid(),
      title: s.title,
      code: s.code,
      approach: s.approach,
      timeComplexity: s.timeComplexity,
      spaceComplexity: s.spaceComplexity,
      runnable: s.runnable || false,
      runnerInput: s.runnerInput
    })),
    tags: meta.tags,
    createdAt: new Date().toISOString()
  };
}

export function generateMany(language: SupportedLanguage, count: number): QuestionPayload[] {
  const n = Math.max(1, Math.min(20, Math.floor(count || 1)));
  const keys = Object.keys(Library) as (keyof typeof Library)[];
  const out: QuestionPayload[] = [];
  for (let i = 0; i < n; i++) {
    const k = keys[i % keys.length];
    const meta = Library[k];
    const sols = (meta.code as any)[language] || [];
    out.push({
      id: uid(),
      language,
      title: meta.title,
      prompt: meta.prompt,
      solutions: sols.map((s: any) => ({
        id: uid(),
        title: s.title,
        code: s.code,
        approach: s.approach,
        timeComplexity: s.timeComplexity,
        spaceComplexity: s.spaceComplexity,
        runnable: s.runnable || false,
        runnerInput: s.runnerInput
      })),
      tags: meta.tags,
      createdAt: new Date().toISOString()
    });
  }
  return out;
}
