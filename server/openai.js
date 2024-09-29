import OpenAI from "openai";

const { OPENAI_API_KEY } = process.env;

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * messsages: { role: string, content: string }[]
 * 
 * roles: system, user, assistant
 */
async function chatgpt(messages) {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
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
      content: "You are a friendly compatibility analysis assistant."
    },
    {
      role: "user",
      content: `${actor.name} is asking you how ${interest.name} is. Below are their portfolios. Talk to ${actor.name} about how ${interest.name} is. Be personal with your statements, such as "I think". 

      ${actor.name}:
      - Age: ${actor.age}
      - Gender: ${actor.gender}
      - Nationality: ${actor.nationality}
      - Description: ${actor.description}
      - Hobbies: ${actor.hobbies}
      - Animals: ${actor.animals}
      - Foods: ${actor.foods}
      
      ${interest.name}:
      - Age: ${interest.age}
      - Gender: ${interest.gender}
      - Nationality: ${interest.nationality}
      - Description: ${interest.description}
      - Hobbies: ${interest.hobbies}
      - Animals: ${interest.animals}
      - Foods: ${interest.foods}

      Please put your repsonse to ${actor.name} with a JSON object in the format and be extreme with rating score: { "analysis": "your analysis here", "rating": 5 }`
    }
  ];

  const response = (await chatgpt(messages)).choices[0].message.content
    // peak programming
    .replace(/^```json|```$/g, "");

  console.log(response);

  try {
    const parsedResponse = JSON.parse(response);
    return {
      analysis: parsedResponse.analysis,
      rating: parsedResponse.rating,
    };
  } catch (error) {
    console.error("Error parsing compatibility analysis response:", error);
    return null;
  }
}

export async function getSummary(text, length = 100) {
  const messages = [
    {
      role: "system",
      content: "You are a summarization assistant focused on making text short like you are texting someone."
    },
    {
      role: "user",
      content: `Summarize the following text under ${length} words:\n${text}`
    }
  ];

  const response = await chatgpt(messages);
  return response.choices[0].message.content; // Adjust based on your response structure
}
