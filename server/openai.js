import { Configuration, OpenAIApi } from "openai";

const { OPENAI_API_KEY } = process.env;

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

/**
 * messsages: { role: string, content: string }[]
 */
async function chatgpt(messages) {
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    messages,
    max_tokens: 500,
  });

  console.log(
    "chatgpt was invoked with:\n"
    + messages.map(({ role, content }) => ` - ${role}: ${content}`).join("\n"));

  return response;
}

// Call the function
chatgpt();
