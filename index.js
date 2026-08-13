// Replace this line:
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// With this:
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build' 
});
