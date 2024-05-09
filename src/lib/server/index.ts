import { drizzle } from 'drizzle-orm/postgres-js';
import { DB_URL } from '$env/static/private';
import postgres from 'postgres';
import * as schema from './schema';

const queryClient = postgres(DB_URL);
export const db = drizzle(queryClient, { schema });
