import OpenAI from "openai";

const openai = new OpenAI();

export async function GET() {
  try {
    const vectorStores = await openai.vectorStores.list();
    return new Response(JSON.stringify(vectorStores), { status: 200 });
  } catch (error) {
    console.error("Error listing vector stores:", error);
    return new Response("Error listing vector stores", { status: 500 });
  }
}
