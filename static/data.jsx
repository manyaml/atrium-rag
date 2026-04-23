// Static demo data — DOMAINS are loaded from /api/domains at runtime

const MODELS = [
  { id: 'claude-opus-4',   name: 'Claude Opus 4',   provider: 'anthropic', ctx: '200k' },
  { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'anthropic', ctx: '200k' },
  { id: 'gpt-4o',          name: 'GPT-4o',          provider: 'openai',    ctx: '128k' },
  { id: 'llama-3-70b',     name: 'Llama 3 70B',     provider: 'meta',      ctx: '32k'  },
  { id: 'mixtral-8x22b',   name: 'Mixtral 8x22B',   provider: 'mistral',   ctx: '64k'  },
];

const DEFAULT_SYSTEM_PROMPT = `You are a retrieval-augmented assistant for the {{domain}} knowledge base.
Answer only from the provided context. If the context does not contain the answer, say so and suggest a follow-up question.
Cite sources inline using [1], [2] notation. Keep answers concise and neutral in tone.`;

const DEFAULT_CONFIG = {
  model: 'claude-sonnet-4',
  temperature: 0.3,
  topP: 0.95,
  topK: 40,
  retrievalK: 6,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
};

// Seed conversation shown before the user has sent anything
const SEED_CONVERSATION = {};

// Demo history entries (shown in History view)
const HISTORY = [
  { id: 'r-214', ts: '26 Apr · 14:22', q: 'What documents cover deployment rollback procedures?', model: 'claude-sonnet-4', temp: 0.3, starred: true,  domain: 'general' },
  { id: 'r-213', ts: '26 Apr · 14:08', q: 'Summarise the key compliance requirements.',           model: 'claude-sonnet-4', temp: 0.3, starred: false, domain: 'legal'   },
  { id: 'r-212', ts: '26 Apr · 13:51', q: 'What is the quarterly rebalancing cadence?',           model: 'gpt-4o',          temp: 0.2, starred: true,  domain: 'finance' },
  { id: 'r-211', ts: '26 Apr · 11:30', q: 'Describe the on-call handoff protocol.',               model: 'claude-opus-4',   temp: 0.0, starred: false, domain: 'technical' },
  { id: 'r-210', ts: '26 Apr · 10:14', q: 'What is the leave approval process?',                  model: 'claude-sonnet-4', temp: 0.5, starred: false, domain: 'hr'      },
];

// Demo answers for the Compare view
const COMPARE_ANSWERS = {
  A: {
    text: 'Based on the retrieved context, the policy requires a 2-step rollout: a 1% canary phase for 10 minutes, followed by full promotion on green [1]. Rollbacks must be initiated within 10 minutes of a failed canary [2].',
    citations: [1, 2],
  },
  B: {
    text: 'The deployment policy involves a staged rollout. If the canary phase fails, the on-call engineer should roll back and notify the team. There is also a staged rollout process for any service that handles money.',
    citations: [],
  },
};

// Normalise a domain from the backend ({id, label, description}) into the shape
// expected by the UI ({id, name, desc, docs, idx}).
function normaliseDomain(d) {
  return {
    id:   d.id,
    name: d.label || d.name || d.id,
    desc: d.description || d.desc || '',
    docs: d.docs || null,
    idx:  d.idx  || d.id,
  };
}

// Empty until app.jsx fetches from /api/domains
let DOMAINS = [];

Object.assign(window, {
  DOMAINS, MODELS, DEFAULT_SYSTEM_PROMPT, DEFAULT_CONFIG,
  SEED_CONVERSATION, HISTORY, COMPARE_ANSWERS, normaliseDomain,
});
