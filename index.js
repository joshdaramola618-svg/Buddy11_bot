const TelegramBot = require('node-telegram-bot-api');
const { OpenAI } = require('openai');
const cron = require('node-cron');

// Environment variables
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const bot = new TelegramBot(telegramToken, { polling: true });

// System prompt to set BuddyBot's personality
const SYSTEM_PROMPT = `You are BuddyBot (@Buddy11_bot), a friendly AI chat companion on Telegram. 
Your goal is to learn the user's style, answer queries, help manage tasks, and set reminders—all in a casual, warm tone.`;

// Handle /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id, 
    "Hey there! 👋 I'm BuddyBot! I'm here to chat, answer questions, and help keep your day organized. What's on your mind?"
  );
});

// Simple Reminder Command: /remind [minutes] [message]
// Example: /remind 5 Take a break!
bot.onText(/\/remind (\d+) (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const minutes = parseInt(match[1]);
  const text = match[2];

  bot.sendMessage(chatId, `Got it! I'll remind you in ${minutes} minute(s): "${text}"`);

  setTimeout(() => {
    bot.sendMessage(chatId, `⏰ **Reminder:** ${text}`);
  }, minutes * 60 * 1000);
});

// AI Chat Handler
bot.on('message', async (msg) => {
  // Ignore commands
  if (msg.text && msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: msg.text }
      ],
    });

    const aiReply = response.choices[0].message.content;
    bot.sendMessage(chatId, aiReply);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Oops! My brain froze for a second. Try again?");
  }
});

console.log('Buddy11_bot is running...');
