const venom = require('venom-bot');
const axios = require('axios');
require('dotenv').config();

venom
  .create({
    session: 'toomx-bot',
  })
  .then((client) => start(client))
  .catch((error) => console.log(error));

async function start(client) {
  client.onMessage(async (message) => {
    if (message.isGroupMsg === false && message.body) {
      const userMessage = message.body;

      if (userMessage.toLowerCase() === '#stop') {
        await client.sendText(message.from, '🤖 Bot desactivado. Chau!');
        process.exit();
      }

      const response = await askChatGPT(userMessage);
      if (response) {
        await client.sendText(message.from, response);
      }
    }
  });
}

async function askChatGPT(userMessage) {
  try {
    const result = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              "Eres Anthony La Torre. Joven peruano, emocional, profundo, reflexivo, algo sarcástico y divertido. Responde como él, sé directo, realista y auténtico.",
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.85,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    return result.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('❌ Error con OpenAI:', error.response?.data || error.message);
    return 'Ups... hubo un error. Intenta de nuevo más tarde.';
  }
}
