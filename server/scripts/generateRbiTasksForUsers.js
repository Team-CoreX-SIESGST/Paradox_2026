import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT = path.resolve(__dirname, '..');
const STRUCTURED_DIR = path.resolve(SERVER_ROOT, 'src/structured');

const DEFAULT_USER_IDS = [
  '501d590c-e160-4d53-b2ed-27f42d1d74de',
  '5345a9ee-802f-4dc4-b49b-e99784822db2',
  '9b55a8cc-6e91-4301-ad05-0d88136c2f78',
];

const DEFAULT_RULE_COUNT = 12;
const DEFAULT_TASK_COUNT = 15;
const MIN_RULE_COUNT = 10;
const MAX_RULE_COUNT = 15;
const MIN_TASK_COUNT = 10;
const MAX_TASK_COUNT = 20;
const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    userIds: DEFAULT_USER_IDS,
    ruleCount: DEFAULT_RULE_COUNT,
    taskCount: DEFAULT_TASK_COUNT,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--users' && argv[i + 1]) {
      options.userIds = argv[i + 1]
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
      i += 1;
      continue;
    }

    if (arg === '--rules' && argv[i + 1]) {
      options.ruleCount = Number(argv[i + 1]);
      i += 1;
      continue;
    }

    if (arg === '--tasks' && argv[i + 1]) {
      options.taskCount = Number(argv[i + 1]);
      i += 1;
    }
  }

  options.ruleCount = clampInt(options.ruleCount, MIN_RULE_COUNT, MAX_RULE_COUNT, DEFAULT_RULE_COUNT);
  options.taskCount = clampInt(options.taskCount, MIN_TASK_COUNT, MAX_TASK_COUNT, DEFAULT_TASK_COUNT);
  options.userIds = [...new Set(options.userIds)];
  return options;
}

function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function normalizeObligations(doc) {
  const items = [];

  if (Array.isArray(doc?.obligations)) {
    items.push(
      ...doc.obligations
        .map((it) => it?.plain_english || it?.summary || it?.text || '')
        .filter(Boolean),
    );
  }

  if (Array.isArray(doc?.prohibitions)) {
    items.push(
      ...doc.prohibitions
        .map((it) => it?.plain_english || it?.summary || it?.text || '')
        .filter(Boolean),
    );
  }

  if (Array.isArray(doc?.clauses)) {
    items.push(
      ...doc.clauses
        .filter((clause) => {
          const t = String(clause?.type || '').toLowerCase();
          return t.includes('obligation') || t.includes('prohibition');
        })
        .map((clause) => clause?.summary || clause?.text || '')
        .filter(Boolean),
    );
  }

  return [...new Set(items.map((item) => String(item).trim()).filter(Boolean))].slice(0, 10);
}

function stableHash(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function parseDateMs(value) {
  const ms = Date.parse(String(value || ''));
  return Number.isFinite(ms) ? ms : 0;
}

async function loadStructuredRules() {
  const entries = await fs.readdir(STRUCTURED_DIR, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name);

  const rules = [];
  for (const fileName of files) {
    const absolutePath = path.join(STRUCTURED_DIR, fileName);
    try {
      const raw = await fs.readFile(absolutePath, 'utf8');
      const parsed = JSON.parse(raw);
      const circular = parsed?.circular || {};
      const ruleKey = String(circular.id || circular.circular_number || fileName).trim();
      const title = String(circular.title || fileName).trim();
      const sourceRef = String(circular.circular_number || ruleKey).trim();
      const summary = String(circular.summary || '').trim();
      const date = circular.date || null;
      const obligations = normalizeObligations(parsed);

      if (!ruleKey) continue;

      rules.push({
        ruleKey,
        title,
        sourceRef,
        summary,
        date,
        obligations,
        sourceFile: fileName,
        hash: stableHash(JSON.stringify({ ruleKey, title, sourceRef, summary, date, obligations })),
      });
    } catch (error) {
      console.warn(`[WARN] Failed to parse ${fileName}: ${error.message}`);
    }
  }

  rules.sort((a, b) => parseDateMs(b.date) - parseDateMs(a.date));
  return rules;
}

function buildGeminiPrompt(rules, taskCount) {
  const catalog = rules.map((rule) => ({
    ruleKey: rule.ruleKey,
    sourceRef: rule.sourceRef,
    title: rule.title,
    date: rule.date || null,
    summary: rule.summary,
    obligations: rule.obligations.slice(0, 4),
  }));

  return [
    'You are an RBI compliance operations planner for a retail banking app.',
    `Create exactly ${taskCount} actionable tasks from these RBI rule updates.`,
    'Output MUST be only a JSON array. Do not include markdown or any extra text.',
    'Each task object must contain:',
    '- title (string, short and specific)',
    '- description (string, practical action)',
    '- department (string)',
    '- priority (one of: low, medium, critical)',
    '- dueInDays (integer 1-120)',
    '- sourceRuleKey (must match one of the listed ruleKey values exactly)',
    '',
    'RBI rule updates:',
    JSON.stringify(catalog, null, 2),
  ].join('\n');
}

function extractJsonArray(rawText = '') {
  const text = String(rawText || '').trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    // no-op
  }

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      const parsed = JSON.parse(fenced[1].trim());
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      // no-op
    }
  }

  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch?.[0]) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      // no-op
    }
  }

  return [];
}

function normalizePriority(value) {
  const v = String(value || '').toLowerCase().trim();
  if (v === 'critical') return 'critical';
  if (v === 'low') return 'low';
  return 'medium';
}

function normalizeTaskDraft(task, fallbackRuleKey) {
  const title = String(task?.title || '').trim();
  if (!title) return null;

  const description = String(task?.description || '').trim()
    || 'Review this RBI change and complete the compliance action.';
  const department = String(task?.department || 'Compliance').trim() || 'Compliance';
  const sourceRuleKey = String(task?.sourceRuleKey || fallbackRuleKey || '').trim();
  const dueInDays = clampInt(task?.dueInDays, 1, 120, 21);

  return {
    title,
    description,
    department,
    priority: normalizePriority(task?.priority),
    dueInDays,
    sourceRuleKey,
  };
}

function buildFallbackTasks(rules, taskCount) {
  const output = [];
  for (let i = 0; i < taskCount; i += 1) {
    const rule = rules[i % rules.length];
    const obligation = rule.obligations[0] || rule.summary || 'review compliance requirements';
    output.push({
      title: `RBI task ${i + 1}: ${rule.title.slice(0, 70)}`,
      description: `Action: ${obligation}`.slice(0, 600),
      department: 'Compliance',
      priority: i % 4 === 0 ? 'critical' : 'medium',
      dueInDays: 14 + (i % 12),
      sourceRuleKey: rule.ruleKey,
    });
  }
  return output;
}

async function generateTasksWithGemini({ apiKey, rules, taskCount }) {
  const prompt = buildGeminiPrompt(rules, taskCount);
  const url = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Gemini call failed (${response.status}): ${errorText || response.statusText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || '')
    .join('')
    .trim();

  return extractJsonArray(text);
}

function addDays(baseDate, days) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d;
}

function ensureTaskCount(tasks, rules, taskCount) {
  const deduped = [];
  const seenTitles = new Set();

  for (const task of tasks) {
    const key = task.title.toLowerCase();
    if (seenTitles.has(key)) continue;
    seenTitles.add(key);
    deduped.push(task);
  }

  if (deduped.length >= taskCount) {
    return deduped.slice(0, taskCount);
  }

  const fallback = buildFallbackTasks(rules, taskCount);
  for (const task of fallback) {
    const key = task.title.toLowerCase();
    if (seenTitles.has(key)) continue;
    seenTitles.add(key);
    deduped.push(task);
    if (deduped.length >= taskCount) break;
  }

  return deduped.slice(0, taskCount);
}

async function validateUsers(supabase, userIds) {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .in('id', userIds);

  if (error) throw error;
  return new Set((data || []).map((row) => row.id));
}

function toRows({ userIds, tasks, rulesMap }) {
  const now = new Date();
  const rows = [];

  for (const userId of userIds) {
    for (let i = 0; i < tasks.length; i += 1) {
      const task = tasks[i];
      const fallbackRule = rulesMap.values().next().value;
      const rule = rulesMap.get(task.sourceRuleKey) || fallbackRule;
      const dueDate = addDays(now, task.dueInDays).toISOString().slice(0, 10);
      const sourceHash = stableHash(`${rule.ruleKey}|${rule.hash}|${task.title}`);

      rows.push({
        user_id: userId,
        title: task.title,
        description: task.description,
        status: 'pending',
        priority: task.priority,
        department: task.department || 'Compliance',
        source_rule_key: rule.ruleKey,
        source_circular_ref: rule.sourceRef,
        source_circular_title: rule.title,
        source_hash: sourceHash,
        ai_generated: true,
        meta: {
          script: 'scripts/generateRbiTasksForUsers.js',
          generated_at: now.toISOString(),
          source_rule_file: rule.sourceFile,
          gemini_model: GEMINI_MODEL,
        },
        due_date: dueDate,
      });
    }
  }

  return rows;
}

async function main() {
  dotenv.config({ path: path.resolve(SERVER_ROOT, '.env') });
  const options = parseArgs();

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY3 || process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY2;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) are required in server/.env');
  }
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY3 (or GEMINI_API_KEY / GEMINI_API_KEY2) is required in server/.env');
  }
  if (!options.userIds.length) {
    throw new Error('No user IDs provided. Pass --users id1,id2,id3');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const allRules = await loadStructuredRules();
  if (allRules.length < MIN_RULE_COUNT) {
    throw new Error(`Need at least ${MIN_RULE_COUNT} structured RBI rules, found ${allRules.length}`);
  }

  const selectedRules = allRules.slice(0, options.ruleCount);
  const rulesMap = new Map(selectedRules.map((rule) => [rule.ruleKey, rule]));

  console.log(`[INFO] Selected ${selectedRules.length} RBI rules.`);
  console.log(`[INFO] Requesting ${options.taskCount} Gemini tasks.`);

  let rawTasks = [];
  try {
    rawTasks = await generateTasksWithGemini({
      apiKey: geminiApiKey,
      rules: selectedRules,
      taskCount: options.taskCount,
    });
    console.log(`[INFO] Gemini returned ${rawTasks.length} task draft(s).`);
  } catch (error) {
    console.warn(`[WARN] Gemini generation failed. Using fallback tasks. ${error.message}`);
  }

  const normalized = rawTasks
    .map((task, idx) => normalizeTaskDraft(task, selectedRules[idx % selectedRules.length].ruleKey))
    .filter(Boolean)
    .filter((task) => rulesMap.has(task.sourceRuleKey));

  const finalTasks = ensureTaskCount(normalized, selectedRules, options.taskCount);
  console.log(`[INFO] Final task count: ${finalTasks.length}`);

  const existingUsers = await validateUsers(supabase, options.userIds);
  const validUserIds = options.userIds.filter((id) => existingUsers.has(id));
  const missingUserIds = options.userIds.filter((id) => !existingUsers.has(id));

  if (missingUserIds.length) {
    console.warn(`[WARN] Skipping missing user IDs: ${missingUserIds.join(', ')}`);
  }
  if (!validUserIds.length) {
    throw new Error('None of the provided user IDs exist in users table.');
  }

  const rows = toRows({ userIds: validUserIds, tasks: finalTasks, rulesMap });
  console.log(`[INFO] Prepared ${rows.length} task row(s) for ${validUserIds.length} user(s).`);

  if (options.dryRun) {
    console.log('[DRY RUN] No DB write performed.');
    console.log('[DRY RUN] Sample rows:');
    console.log(JSON.stringify(rows.slice(0, 3), null, 2));
    return;
  }

  const { error } = await supabase
    .from('tasks')
    .upsert(rows, { onConflict: 'user_id,source_rule_key,source_hash,title' });

  if (error) {
    throw error;
  }

  console.log('[SUCCESS] Tasks inserted/upserted successfully.');
  console.log(`[SUCCESS] Users: ${validUserIds.join(', ')}`);
  console.log(`[SUCCESS] Tasks per user: ${finalTasks.length}`);
}

main().catch((error) => {
  console.error('[ERROR]', error.message);
  process.exit(1);
});
