import { log } from "console";
import { OpenAIStream, OpenAIStreamPayload } from "../../utils/OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

if (!process.env.TURNSTILE_SITE_KEY || !process.env.TURNSTILE_SECRET_KEY) {
  throw new Error("Missing env var from Turnstile");
}

export const config = {
  runtime: "edge",
};

async function checkTurnstileToken(token: string): Promise<boolean> {
  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

  const formData = new FormData();
  formData.append("secret", process.env.TURNSTILE_SECRET_KEY ?? "");
  formData.append("response", token);

  try {
    const result = await fetch(url, {
      body: formData,
      method: "POST",
    });

    const outcome = await result.json();
    if (outcome.success) {
      return true;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
  return false;
}

const handler = async (req: Request): Promise<Response> => {
  // check turnstile token
  const turnstileCheck = await checkTurnstileToken(
    req.headers.get("x-turnstile-token") ?? ""
  );

  if (!turnstileCheck) {
    return new Response("Invalid Turnstile token", { status: 400 });
  }

  const { prompt } = (await req.json()) as {
    prompt?: string;
  };

  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  log("prompt: ", prompt);

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
};

export default handler;
