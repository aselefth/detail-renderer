import type { RequestHandler } from "./$types";
import { writeFile } from 'node:fs/promises'

export const POST: RequestHandler = async ({ request }) => {
    const form = await request.formData();
    const files = form.getAll('file') as File[];
    files.forEach(async (file) => {
        console.log(file.name, file.type);
        const buf = await file.arrayBuffer();
        const dataView = new DataView(buf);
        writeFile(`files/${file.name}`, dataView);
    });
    console.log(form)
    return new Response("ok", { status: 201 });
}