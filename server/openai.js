import { Configuration, OpenAIApi } from "openai";

const { OPENAI_API_KEY } = process.env;

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

/**
 * messsages: { role: string, content: string }[]
 * 
 * roles: system, user, assistant
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

export async function getCompatibilityAnalysis(actor, interest) {
  const messages = [
    {
      role: "system",
      content: "You are a compatibility analysis assistant."
    },
    {
      role: "user",
      content: `Analyze the compatibility between the following two users and provide a JSON response with 'analysis' (string) and 'rating' (number) between 0-10:
      User A:
      - Username: ${actor.username}
      - Age: ${actor.age}
      - Gender: ${actor.gender}
      - Nationality: ${actor.nationality}
      - Description: ${actor.description}
      - Hobbies: ${actor.hobbies}
      - Animals: ${actor.animals}
      - Foods: ${actor.foods}
      
      User B:
      - Username: ${interest.username}
      - Age: ${interest.age}
      - Gender: ${interest.gender}
      - Nationality: ${interest.nationality}
      - Description: ${interest.description}
      - Hobbies: ${interest.hobbies}
      - Animals: ${interest.animals}
      - Foods: ${interest.foods}

      Please respond with a JSON object in the format: { "analysis": "your analysis here", "rating": 8 }`
    }
  ];

  const response = await chatgpt(messages);

  try {
    const parsedResponse = JSON.parse(response.data.choices[0].message.content);
    return {
      analysis: parsedResponse.analysis,
      rating: parsedResponse.rating,
    };
  } catch (error) {
    console.error("Error parsing compatibility analysis response:", error);
    return null;
  }
}

export async function getSummary(text) {
  const messages = [
    {
      role: "system",
      content: "You are a summarization assistant."
    },
    {
      role: "user",
      content: `Please summarize the following text:\n${text}`
    }
  ];

  const response = await chatgpt(messages);
  return response.data.choices[0].message.content; // Adjust based on your response structure
}
