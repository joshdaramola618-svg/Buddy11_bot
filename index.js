const TelegramBot = require('node-telegram-bot-api');
const { OpenAI } = require('openai');

// Load environment variables from Railway
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const openaiApiKey = process.env.OPENAI_API_KEY;

// Safety check for tokens
if (!telegramToken) {
  console.error("❌ ERROR: TELEGRAM_BOT_TOKEN is missing in Railway Environment Variables!");
  process.exit(1);
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openaiApiKey || 'dummy_key_to_prevent_crash'
});

// Initialize Telegram Bot
const bot = new TelegramBot(telegramToken, { polling: true });

// System prompt defining BuddyBot's personality
const SYSTEM_PROMPT = `You are BuddyBot (@Buddy11_bot), a friendly AI chat companion on Telegram. 
Your goal is to learn the user's style, answer queries, help manage tasks, and set reminders—all in a casual, warm, and helpful tone. Keep responses clear and concise.`;

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'friend';

  bot.sendMessage(
    chatId,
    `Hey ${firstName}! 👋 I'm BuddyBot (@Buddy11_bot).\n\n` +
    `I'm your AI companion! Here is what I can do for you:\n` +
    `💬 **Chat & Answer Questions** - Just send me any message!\n` +
    `⏰ **Set Reminders** - Type \`/remind 5 Take a short break\` (minutes + text)\n\n` +
    `What's on your mind today?`
  );
});

// Handle /remind command
// Format: /remind [minutes] [message]
bot.onText(/\/remind (\d+) (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const minutes = parseInt(match[1]);
  const text = match[2];

  bot.sendMessage(chatId, ` Got it! I'll remind you in ${minutes} minute(s): "${text}"`);

  setTimeout(() => {
    bot.sendMessage(chatId, `⏰ **Reminder:** ${text}`);
  }, minutes * 60 * 1000);
});

// Handle incoming regular chat messages
bot.on('message', async (msg) => {
  // Ignore command messages starting with /
  if (msg.text && msg.text.startsWith('/')) return;
  if (!msg.text) return; // Ignore stickers, voice messages, images, etc.

  const chatId = msg.chat.id;

  // Check if OpenAI key was set
  if (!openaiApiKey) {
    return bot.sendMessage(chatId, "⚠️ OpenAI API key is missing! Please set `OPENAI_API_KEY` in Railway variables.");
  }

  try {
    // Send a typing action so the user knows the bot is processing
    bot.sendChatAction(chatId, 'typing');

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
    console.error("OpenAI API Error:", error.message);
    bot.sendMessage(chatId, "Oops! My brain froze for a second. Please try again in a moment.");
  }
});

console.log("🚀 Buddy11_bot is live and running on Railway!");
