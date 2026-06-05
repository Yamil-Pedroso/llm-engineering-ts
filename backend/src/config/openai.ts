import OpenAI from "openai";
import dotenv from "dotenv";
import { env } from "./env";

dotenv.config();

console.log("OpenAI key exists:", Boolean(env.OPENAI_API_KEY));

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});
