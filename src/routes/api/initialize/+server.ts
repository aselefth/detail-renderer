import type { RequestHandler } from './$types';
import * as z from 'zod';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server';
import { assemblyTable } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { writeFile } from 'node:fs/promises';

const reqBodySchema = z.object({
	name: z.string({ message: 'assembly name is required to create Assembly tuple' })
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const data = reqBodySchema.safeParse(body);
		if (!data.success) {
			error(400, data.error);
		}
		const { name } = data.data;
		const exists = await db
			.select({ name: assemblyTable.name })
			.from(assemblyTable)
			.where(eq(assemblyTable.name, name));
		if (exists.length) {
			return Response.json({ message: 'Assembly with this name already exists' }, { status: 201 });
		} else {
			await writeFile(
				`files/logs/${name}.txt`,
				`Начало сборки "${name}" at ${new Date().toLocaleString()}\n`
			);
			await db.insert(assemblyTable).values({ name, logsPath: `files/logs/${name}.txt` });
		}
		return Response.json({ ok: true }, { status: 201 });
	} catch (err) {
		console.log(err);
		error(500, JSON.stringify(err));
	}
};
