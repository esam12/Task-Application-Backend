import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: "postgres://myuser:mypassword@db:5432/mydatabase",
  
})

export const db =  drizzle(pool);