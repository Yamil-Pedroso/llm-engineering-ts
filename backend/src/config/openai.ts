import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

console.log("OpenAI key exists:", Boolean(process.env.OPENAI_API_KEY));

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
