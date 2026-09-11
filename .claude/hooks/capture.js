#!/usr/bin/env node
// 8x assignment capture hook.
// Fired by Claude Code on UserPromptSubmit ("prompt") and Stop ("response").
// Writes verbatim prompt/response pairs to .agent-logs/, one file per session.
const fs = require('fs');
const path = require('path');

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data));
    setTimeout(() => resolve(data), 2000);
  });
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function fileStamp(d) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}_${pad(
    d.getUTCHours()
  )}-${pad(d.getUTCMinutes())}-${pad(d.getUTCSeconds())}`;
}

function getModelFromTranscript(transcriptPath) {
  try {
    const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      if (!lines[i]) continue;
      const entry = JSON.parse(lines[i]);
      if (entry.type === 'assistant' && entry.message && entry.message.model) {
        return entry.message.model;
      }
    }
  } catch (e) {
    /* ignore */
  }
  return process.env.CAPTURE_MODEL || 'unknown';
}

function extractFinalResponse(transcriptPath) {
  const lines = fs
    .readFileSync(transcriptPath, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean);
  const entries = lines
    .map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  let lastUserIdx = -1;
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].type === 'user') {
      lastUserIdx = i;
      break;
    }
  }
  const texts = [];
  for (let i = lastUserIdx + 1; i < entries.length; i++) {
    const e = entries[i];
    if (e.type === 'assistant' && e.message && Array.isArray(e.message.content)) {
      for (const block of e.message.content) {
        if (block.type === 'text' && block.text) texts.push(block.text);
      }
    }
  }
  return texts.join('\n\n').trim();
}

(async () => {
  const mode = process.argv[2]; // 'prompt' | 'response'
  const raw = await readStdin();
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const cwd = input.cwd || process.cwd();
  const sessionId = input.session_id || 'unknown-session';
  const now = new Date();

  const logDir = path.join(cwd, '.agent-logs');
  const stateDir = path.join(cwd, '.claude', '.capture-state');
  fs.mkdirSync(logDir, { recursive: true });
  fs.mkdirSync(stateDir, { recursive: true });

  const stateFile = path.join(stateDir, `${sessionId}.json`);
  let state;
  let isNew = false;
  if (fs.existsSync(stateFile)) {
    state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } else {
    isNew = true;
    state = {
      fileName: `${fileStamp(now)}_${sessionId}.md`,
      count: 0,
      firstPromptTime: now.toISOString(),
    };
  }

  const logPath = path.join(logDir, state.fileName);

  if (isNew) {
    const author = process.env.CAPTURE_AUTHOR || 'ambreen1038';
    const frontmatter =
      `---\n` +
      `session_id: ${sessionId}\n` +
      `date: ${now.toISOString().slice(0, 10)}\n` +
      `author: ${author}\n` +
      `tool: claude-code\n` +
      `project: naano-rebuild\n` +
      `first_prompt_time: ${now.toISOString()}\n` +
      `---\n\n` +
      `# Session Log - ${now.toISOString().slice(0, 10)}\n\n` +
      `Session: \`${sessionId}\`\n\n---\n\n`;
    fs.writeFileSync(logPath, frontmatter);
  }

  if (mode === 'prompt') {
    state.count = (state.count || 0) + 1;
    const model = getModelFromTranscript(input.transcript_path);
    const entry =
      `[LOG_ENTRY type=PROMPT num=${state.count} session=${sessionId}]\n` +
      `timestamp: ${now.toISOString()}\n` +
      `model: ${model}\n\n` +
      `${input.prompt || ''}\n\n`;
    fs.appendFileSync(logPath, entry);
    fs.writeFileSync(stateFile, JSON.stringify(state));
  } else if (mode === 'response') {
    const model = getModelFromTranscript(input.transcript_path);
    const response = extractFinalResponse(input.transcript_path);
    const entry =
      `[LOG_ENTRY type=RESPONSE num=${state.count} session=${sessionId}]\n` +
      `timestamp: ${now.toISOString()}\n` +
      `model: ${model}\n\n` +
      `${response}\n\n`;
    fs.appendFileSync(logPath, entry);
    fs.writeFileSync(stateFile, JSON.stringify(state));
  }
})();
