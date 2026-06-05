import { Pool } from "pg";
import { env } from "../env";

export const postgres = new Pool({
  host: env.POSTGRES_HOST,
  port: Number(env.POSTGRES_PORT),
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  database: env.POSTGRES_DB,
});
