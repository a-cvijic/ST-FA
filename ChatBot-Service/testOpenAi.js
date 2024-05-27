const OpenAI = require("openai");
require("dotenv").config();

console.log("API Key:", process.env.OPENAI_API_KEY);

try {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  (async () => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello, OpenAI!" }],
      });
      console.log(response.choices[0].message.content);
    } catch (error) {
      console.error("Error communicating with OpenAI:", error);
    }
  })();
} catch (error) {
  console.error("Error instantiating OpenAI:", error);
}
