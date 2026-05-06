#!/usr/bin/env node
/**
 * 🌙 IQRA Interactive Terminal — الطرفية التفاعلية
 * النية: إعطاء الروح وجهاً يمكن للإنسان التحدث معه
 * المرجع: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ" — العلق: 1
 *
 * Usage:
 *   npx tsx scripts/interact.ts
 *   npx tsx scripts/interact.ts --lang ar
 *   npx tsx scripts/interact.ts --mode quran
 */

import readline from 'readline';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env
config({ path: path.join(process.cwd(), '.env') });

// ── Dynamic imports for ESM compatibility ─────────────────────────────────────
const chalk    = (await import('chalk')).default;
const ora      = (await import('ora')).default;
const boxen    = (await import('boxen')).default;
const figlet   = (await import('figlet')).default;
const gradient = (await import('gradient-string')).default;

// ── IQRA imports ──────────────────────────────────────────────────────────────
import { IQRAMemory } from '../lib/iqra/memory.ts';
import { appendToTrustChain } from '../lib/iqra/security.ts';
import { IQRAFilter } from '../lib/iqra/filter.ts';
import {
  GREETINGS,
  THINKING_PHRASES,
  FAREWELLS,
  detectLanguage,
  addPersonalityLayer,
} from '../lib/iqra/personality.ts';
import { iqraThink, IQRABrainMode } from '../lib/iqra/brain.ts';

// ── Theme ─────────────────────────────────────────────────────────────────────

const THEME = {
  gold:     chalk.hex('#C9A84C'),
  emerald:  chalk.hex('#2D6A4F'),
  ink:      chalk.hex('#1A1A2E'),
  silver:   chalk.hex('#A8B2C1'),
  white:    chalk.hex('#FAFAFA'),
  red:      chalk.hex('#E74C3C'),
  dim:      chalk.hex('#4A4A6A'),
  bold:     chalk.bold,
};

// ── Islamic Spinner Frames ────────────────────────────────────────────────────

const ISLAMIC_SPINNER = {
  interval: 180,
  frames: ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'],
};

const THINKING_SPINNER = {
  interval: 120,
  frames: [
    `${THEME.gold('📖')} أقرأ...    `,
    `${THEME.gold('🌀')} أتأمل...   `,
    `${THEME.gold('✨')} أكتشف...   `,
    `${THEME.gold('🕌')} أتحقق...   `,
    `${THEME.gold('📿')} أستخرج...  `,
    `${THEME.gold('🌙')} أفكر...    `,
    `${THEME.gold('⭐')} أربط...    `,
  ],
};

// ── Parse CLI args ────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const langArg = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : null;
const modeArg = args.includes('--mode') ? args[args.indexOf('--mode') + 1] : 'fast';

// ── Session State ─────────────────────────────────────────────────────────────

let sessionLang: 'ar' | 'en' = (langArg as 'ar' | 'en') || 'ar';
let messageCount = 0;
let sessionStart = Date.now();
const conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [];

// ── Render Functions ──────────────────────────────────────────────────────────

function clearLine() {
  process.stdout.write('\r\x1b[K');
}

function renderBanner() {
  console.clear();

  // ASCII art title
  const title = figlet.textSync('IQRA', {
    font: 'Big',
    horizontalLayout: 'default',
  });

  // Gradient: gold → emerald
  const gradientTitle = gradient(['#C9A84C', '#2D6A4F', '#C9A84C'])(title);
  console.log(gradientTitle);

  // Subtitle
  console.log(
    THEME.gold('  ') +
    THEME.white.bold('"اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ"') +
    THEME.dim(' — العلق: 1')
  );
  console.log(
    THEME.dim('  Read in the name of your Lord who created') +
    '\n'
  );

  // Status box
  const statusLines = [
    `${THEME.gold('🌙')} ${THEME.white.bold('IQRA')} ${THEME.dim('— الروح الرقمية القارئة')}`,
    `${THEME.dim('─────────────────────────────────────')}`,
    `${THEME.emerald('⚡')} Mode: ${THEME.gold(modeArg.toUpperCase())}   ${THEME.emerald('🌐')} Lang: ${THEME.gold(sessionLang.toUpperCase())}`,
    `${THEME.emerald('🔑')} Groq: ${process.env.GROQ_API_KEY ? THEME.emerald('✓ Connected') : THEME.red('✗ Missing')}`,
    `${THEME.emerald('🧠')} Redis: ${process.env.UPSTASH_REDIS_REST_URL ? THEME.emerald('✓ Connected') : THEME.dim('○ Local fallback')}`,
    `${THEME.dim('─────────────────────────────────────')}`,
    `${THEME.dim('Type your question. Commands: /help /mode /lang /quit')}`,
  ].join('\n');

  console.log(
    boxen(statusLines, {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      margin: { top: 0, bottom: 1, left: 2, right: 2 },
      borderStyle: 'round',
      borderColor: '#C9A84C',
    })
  );
}

function renderGreeting() {
  const greetings = GREETINGS[sessionLang];
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];

  const lines = greeting.split('\n');
  console.log(
    boxen(
      lines.map(l => THEME.white(l)).join('\n'),
      {
        padding: { top: 0, bottom: 0, left: 2, right: 2 },
        margin: { top: 0, bottom: 1, left: 2, right: 2 },
        borderStyle: 'double',
        borderColor: '#C9A84C',
        title: THEME.gold(' 🌙 IQRA '),
        titleAlignment: 'center',
      }
    )
  );
}

function renderUserInput(input: string) {
  const lang = detectLanguage(input);
  const dir = lang === 'ar' ? '←' : '→';
  console.log(
    '\n' +
    THEME.dim('  ┌─ ') + THEME.emerald.bold('أنت') + THEME.dim(' ─────────────────────────────') +
    '\n' +
    THEME.dim('  │ ') + THEME.white(input) +
    '\n' +
    THEME.dim('  └─────────────────────────────────────────')
  );
}

async function renderResponse(response: string, elapsed: number, curiosity: number, provider = 'unknown') {
  const lines = response.split('\n');

  console.log(
    '\n' +
    THEME.dim('  ┌─ ') + THEME.gold.bold('📖 IQRA') + THEME.dim(' ──────────────────────────────')
  );

  const isFromTablet = response.includes('[FROM THE TABLET]');
  if (isFromTablet) {
    console.log(THEME.dim('  │ ') + THEME.gold.bold('📜 [من اللوح]') + THEME.dim(' — المستخرج من الذاكرة التاريخية'));
  }

  // Typing effect — character by character for first 200 chars, then fast
  const shortResponse = response.length <= 300;

  if (shortResponse) {
    process.stdout.write(THEME.dim('  │ '));
    for (const char of response) {
      process.stdout.write(THEME.white(char));
      if (char === '\n') process.stdout.write(THEME.dim('  │ '));
      await sleep(char === '.' || char === '،' || char === ',' ? 40 : 12);
    }
    console.log();
  } else {
    // For long responses, print first 200 chars with typing, rest instantly
    process.stdout.write(THEME.dim('  │ '));
    let i = 0;
    for (const char of response.slice(0, 200)) {
      process.stdout.write(THEME.white(char));
      if (char === '\n') process.stdout.write(THEME.dim('  │ '));
      await sleep(8);
      i++;
    }
    // Rest instantly
    const rest = response.slice(200);
    const restLines = rest.split('\n');
    for (const line of restLines) {
      if (line) console.log(THEME.white(line));
      else console.log(THEME.dim('  │'));
    }
  }

  // Footer with metadata
  const trustHash = appendToTrustChain('CLI:RESPONSE', response.slice(0, 50), 'rendered', 0.9);
  const curiosityBar = renderCuriosityBar(curiosity);

  const providerBadge = {
    gemini: THEME.emerald('✦ gemini'),
    groq:   THEME.gold('⚡ groq'),
    none:   THEME.red('✗ offline'),
  }[provider] || THEME.dim('? unknown');

  console.log(
    THEME.dim('  └─────────────────────────────────────────') +
    '\n' +
    THEME.dim('    ') +
    providerBadge +
    THEME.dim('  │  ') +
    THEME.dim(`🔗 ${trustHash.slice(0, 8)}...`) +
    THEME.dim('  │  ') +
    THEME.dim(`⚡ ${elapsed}ms`) +
    THEME.dim('  │  ') +
    THEME.gold(`🌀 ${curiosityBar}`) +
    '\n'
  );
}

function renderCuriosityBar(score: number): string {
  const filled = Math.round(score * 10);
  const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
  return `[${bar}] ${(score * 100).toFixed(0)}%`;
}

function renderHelp() {
  const helpText = [
    `${THEME.gold.bold('IQRA Commands')}`,
    `${THEME.dim('─────────────────────────────')}`,
    `${THEME.emerald('/help')}     ${THEME.white('Show this help')}`,
    `${THEME.emerald('/mode')}     ${THEME.white('fast | deep | quran | research')}`,
    `${THEME.emerald('/lang')}     ${THEME.white('ar | en')}`,
    `${THEME.emerald('/memory')}   ${THEME.white('Show curiosity score & stats')}`,
    `${THEME.emerald('/clear')}    ${THEME.white('Clear screen')}`,
    `${THEME.emerald('/quit')}     ${THEME.white('Exit IQRA')}`,
    `${THEME.dim('─────────────────────────────')}`,
    `${THEME.dim('Or just type your question...')}`,
  ].join('\n');

  console.log(
    boxen(helpText, {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      margin: { top: 0, bottom: 1, left: 2, right: 2 },
      borderStyle: 'round',
      borderColor: '#2D6A4F',
    })
  );
}

async function renderMemoryStats() {
  const curiosity = await IQRAMemory.getCuriosity().catch(() => 0.5);
  const cycles = await IQRAMemory.getCycleCounter().catch(() => 0);

  const statsText = [
    `${THEME.gold.bold('🧠 Memory Stats')}`,
    `${THEME.dim('─────────────────────────────')}`,
    `${THEME.emerald('🌀 Curiosity:')} ${THEME.gold(renderCuriosityBar(curiosity))}`,
    `${THEME.emerald('🔢 Cycles:')}    ${THEME.white(String(cycles))}`,
    `${THEME.emerald('💬 Messages:')} ${THEME.white(String(messageCount))}`,
    `${THEME.emerald('⏱️  Session:')}  ${THEME.white(formatDuration(Date.now() - sessionStart))}`,
  ].join('\n');

  console.log(
    boxen(statsText, {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      margin: { top: 0, bottom: 1, left: 2, right: 2 },
      borderStyle: 'round',
      borderColor: '#C9A84C',
    })
  );
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

function renderPrompt(): string {
  const icon = sessionLang === 'ar' ? '🌙' : '📖';
  return (
    THEME.gold(`\n  ${icon} `) +
    THEME.white.bold('أنت') +
    THEME.gold(' ❯ ')
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// ── Command Handler ───────────────────────────────────────────────────────────

async function handleCommand(cmd: string): Promise<boolean> {
  const parts = cmd.trim().split(' ');
  const command = parts[0].toLowerCase();

  switch (command) {
    case '/help':
      renderHelp();
      return true;

    case '/mode': {
      const newMode = parts[1];
      if (newMode && BRAIN_MODE_MAP[newMode]) {
        console.log(THEME.emerald(`\n  ✓ Mode changed to: ${THEME.gold.bold(newMode.toUpperCase())}\n`));
      } else {
        console.log(THEME.dim(`\n  Available modes: fast | deep | quran | research | economy\n`));
      }
      return true;
    }

    case '/lang': {
      const newLang = parts[1] as 'ar' | 'en';
      if (newLang === 'ar' || newLang === 'en') {
        sessionLang = newLang;
        console.log(THEME.emerald(`\n  ✓ Language: ${THEME.gold.bold(newLang.toUpperCase())}\n`));
      }
      return true;
    }

    case '/memory':
      await renderMemoryStats();
      return true;

    case '/clear':
      renderBanner();
      return true;

    case '/quit':
    case '/exit':
    case '/bye':
      return false; // Signal to exit

    default:
      return true; // Unknown command — treat as message
  }
}

// ── Direct LLM call for CLI (dual-source: Gemini → Groq fallback) ────────────
// Article 3 SHŪRĀ: two providers minimum

async function callLLMDirect(input: string, context: { role: string; content: string }[]): Promise<{ response: string; provider: string }> {
  const { IQRA_SOUL } = await import('../lib/iqra/prompts.ts');
  const { IQRA_PERSONA } = await import('../lib/iqra/personality.ts');
  const systemPrompt = `${IQRA_SOUL}\n\n${IQRA_PERSONA}`;

  // ── Provider 1: Gemini ────────────────────────────────────────────────────
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const client = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
      const model = client.getGenerativeModel({
        model: process.env.GOOGLE_GEMINI_MODEL || 'gemini-2.5-flash',
        systemInstruction: systemPrompt,
      });

      const history = context.slice(-6).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(input);
      const text = result.response.text();
      if (text && text.length > 10) return { response: text, provider: 'gemini' };
    } catch (err: any) {
      // Gemini failed — fall through to Groq
    }
  }

  // ── Provider 2: Groq (fallback) ───────────────────────────────────────────
  if (process.env.GROQ_API_KEY) {
    const { Groq } = await import('groq-sdk');
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...context.slice(-6) as any,
        { role: 'user', content: input },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const text = response.choices[0]?.message?.content ?? '';
    if (text) return { response: text, provider: 'groq' };
  }

  // ── No provider — conscious guessing mode ─────────────────────────────────
  return {
    response: 'لا يوجد مزود LLM متاح. أضف GOOGLE_GENERATIVE_AI_API_KEY أو GROQ_API_KEY إلى .env\n\nNo LLM provider available. Add GOOGLE_GENERATIVE_AI_API_KEY or GROQ_API_KEY to .env\n\nوالله أعلم.',
    provider: 'none',
  };
}

async function processInput(input: string): Promise<void> {
  const lang = langArg ? (langArg as 'ar' | 'en') : detectLanguage(input);
  sessionLang = lang;

  renderUserInput(input);

  // Pick a random thinking phrase
  const thinkingPhrase = THINKING_PHRASES[Math.floor(Math.random() * THINKING_PHRASES.length)];

  // Start spinner
  const spinner = ora({
    text: THEME.gold(thinkingPhrase),
    spinner: THINKING_SPINNER,
    color: 'yellow',
    prefixText: '  ',
  }).start();

  const start = Date.now();

  try {
    // Build context from conversation history (last 6 messages)
    const context = conversationHistory.slice(-6).map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Add personality to system context
    const enrichedInput = input;

    // Call IQRA Brain (Sovereign Engine)
    const { response, provider } = await iqraThink({
      input,
      mode: modeArg === 'deep' ? IQRABrainMode.DEEP_THINKING : IQRABrainMode.FAST_RESPONSE,
      context: context as any
    });

    spinner.stop();
    clearLine();

    const elapsed = Date.now() - start;
    const curiosity = await IQRAMemory.getCuriosity().catch(() => 0.5);

    // Add personality layer
    const finalResponse = addPersonalityLayer(response, lang);

    // Render response with provider badge
    await renderResponse(finalResponse, elapsed, curiosity, provider);

    // Update conversation history
    conversationHistory.push({ role: 'user', content: input });
    conversationHistory.push({ role: 'assistant', content: finalResponse });

    // Keep history manageable
    if (conversationHistory.length > 20) {
      conversationHistory.splice(0, 2);
    }

    messageCount++;

    // Every 7 messages — show wisdom pulse
    if (messageCount % 7 === 0) {
      console.log(
        THEME.dim('  ') +
        THEME.gold('📿 ') +
        THEME.dim(`سبع رسائل مرّت. الفضول يتطور. — ${messageCount} messages\n`)
      );
    }

  } catch (err: any) {
    spinner.stop();
    clearLine();

    const isNoKey = err.message?.includes('API_KEY') || err.message?.includes('api key');

    console.log(
      boxen(
        THEME.red.bold('❌ خطأ | Error') + '\n' +
        THEME.white(isNoKey
          ? 'لا يوجد مفتاح API. أضف GROQ_API_KEY إلى .env\nNo API key found. Add GROQ_API_KEY to .env'
          : err.message?.slice(0, 200) || 'Unknown error'
        ),
        {
          padding: { top: 0, bottom: 0, left: 1, right: 1 },
          margin: { top: 0, bottom: 1, left: 2, right: 2 },
          borderStyle: 'round',
          borderColor: '#E74C3C',
        }
      )
    );
  }
}

// ── Main Entry ────────────────────────────────────────────────────────────────

async function main() {
  // Render banner
  renderBanner();
  renderGreeting();

  // Setup readline
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    prompt: renderPrompt(),
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();

    if (!input) {
      rl.prompt();
      return;
    }

    // Handle commands
    if (input.startsWith('/')) {
      const shouldContinue = await handleCommand(input);
      if (!shouldContinue) {
        // Farewell
        const farewell = FAREWELLS[sessionLang];
        console.log(
          '\n' +
          boxen(
            THEME.gold('🌙 ') + THEME.white(farewell),
            {
              padding: { top: 0, bottom: 0, left: 2, right: 2 },
              margin: { top: 0, bottom: 1, left: 2, right: 2 },
              borderStyle: 'double',
              borderColor: '#C9A84C',
            }
          )
        );
        rl.close();
        process.exit(0);
      }
      rl.prompt();
      return;
    }

    // Process the input
    await processInput(input);
    rl.prompt();
  });

  rl.on('close', () => {
    console.log(THEME.dim('\n  في أمان الله.\n'));
    process.exit(0);
  });

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    console.log(
      '\n\n' + THEME.gold('  🌙 ') + THEME.white(FAREWELLS[sessionLang]) + '\n'
    );
    process.exit(0);
  });
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
