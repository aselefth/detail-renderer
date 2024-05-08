import type { RequestHandler } from './$types';
import { writeFile } from 'node:fs/promises';
import fs from 'node:fs/promises';
import sharp from 'sharp';

const SHAPE = 640;

const CLASSES = {
    Base: 0,
    Base_Cap: 1,
    C_Clamp1: 2,
    Planet_Gear: 3,
    Planet_Gear_Carrier: 4,
    Ring_Gear_Handle: 5,
    Planet_Gear_Carrier_Rod: 6,
    Ring_Gear: 7,
    Sun_Gear: 8,
    Sun_Gear_Handle: 9
};

export const POST: RequestHandler = async ({ request }) => {
    const form = await request.formData();
    const trainOnly = form.get('trainOnly') as string | null;
    const files = form.getAll('file') as File[];
    try {
        await fs.access('files');
    } catch (error) {
        await fs.mkdir('files', { mode: 0o777 });
    }

    try {
        await fs.access('files/train');
    } catch (error) {
        await fs.mkdir('files/train', { mode: 0o777 });
    }

    try {
        await fs.access('files/valid');
    } catch (error) {
        await fs.mkdir('files/valid', { mode: 0o777 });
    }
    try {
        await fs.access('files/train/labels');
    } catch (error) {
        await fs.mkdir('files/train/labels', { mode: 0o777 });
    }
    try {
        await fs.access('files/train/images');
    } catch (error) {
        await fs.mkdir('files/train/images', { mode: 0o777 });
    }
    try {
        await fs.access('files/valid/labels');
    } catch (error) {
        await fs.mkdir('files/valid/labels', { mode: 0o777 });
    }
    try {
        await fs.access('files/valid/images');
    } catch (error) {
        await fs.mkdir('files/valid/images', { mode: 0o777 });
    }
    try {
        await fs.access('noise.png');
    } catch (error) {
        await sharp({
            create: {
                width: SHAPE,
                height: SHAPE,
                channels: 3,
                background: {
                    r: 120,
                    g: 110,
                    b: 80
                },
                noise: {
                    type: 'gaussian',
                    mean: 1000,
                    sigma: 400,
                }
            }
        }).negate().toFile('noise.png');
    }
    console.log(files[0].name);

    if (!trainOnly) {
        files.forEach(async (file) => {
            const buf = await file.arrayBuffer();
            const fileName = `${file.name.split('.')[0]}.txt`;
            const className = file.name.split('~')[0] as keyof typeof CLASSES;
            const resized = sharp(buf).resize({
                width: SHAPE,
                height: SHAPE,
                fit: 'contain'
            }).jpeg();
            resized.toFile(`files/valid/images/v${file.name}`);

            const { data } = await resized.clone().raw().toBuffer({ resolveWithObject: true });

            let lowestX = SHAPE;
            let highestX = 0;
            let highestY = 0;
            let lowestY = SHAPE;
            for (let y = 0; y < SHAPE; y++) {
                for (let x = 0; x < SHAPE; x++) {
                    const i = (y * SHAPE + x) * 3;
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const hasPixelInfo = [r, g, b].every((v) => v > 5);
                    if (hasPixelInfo) {
                        if (x < lowestX) lowestX = x;
                        if (x > highestX) highestX = x;
                        if (y < lowestY) lowestY = y;
                        if (y > highestY) highestY = y;
                    }
                }
            }
            const centerX = (lowestX + (highestX - lowestX) / 2) / SHAPE;
            const objectWidth = (highestX - lowestX) / SHAPE;
            const objectHeight = (highestY - lowestY) / SHAPE;
            const centerY = (lowestY + (highestY - lowestY) / 2) / SHAPE;


            await writeFile(
                `files/valid/labels/v${fileName}`,
                `${CLASSES[className]} ${centerX.toFixed(4)} ${centerY.toFixed(4)} ${objectWidth.toFixed(4)} ${objectHeight.toFixed(4)}`
            );
            await writeFile(
                `files/train/labels/tgrayscale${fileName}`,
                `${CLASSES[className]} ${centerX.toFixed(4)} ${centerY.toFixed(4)} ${objectWidth.toFixed(4)} ${objectHeight.toFixed(4)}`
            );
            await writeFile(
                `files/train/labels/tnoise${fileName}`,
                `${CLASSES[className]} ${centerX.toFixed(4)} ${centerY.toFixed(4)} ${objectWidth.toFixed(4)} ${objectHeight.toFixed(4)}`
            );
            await writeFile(
                `files/train/labels/tblur${fileName}`,
                `${CLASSES[className]} ${centerX.toFixed(4)} ${centerY.toFixed(4)} ${objectWidth.toFixed(4)} ${objectHeight.toFixed(4)}`
            );

            resized.clone().grayscale().jpeg({ quality: 100 }).toFile(`files/train/images/tgrayscale${file.name}`);
            resized.clone().linear([0.6, 1.2, 1], [20, Math.random() * 5 + 5, Math.random() * 50 + 10]).jpeg({ quality: 100 }).toFile(`files/train/images/tblur${file.name}`);
            resized.composite([
                {
                    input: "noise.png",
                    gravity: 'southwest',
                    blend: "add"
                }
            ]).jpeg({ quality: 100 }).toFile(`files/train/images/tnoise${file.name}`);
            console.log('done');
        });
    } else {
        files.forEach(async (file) => {
            const buf = await file.arrayBuffer();
            const fileName = `${file.name.split('.')[0]}.txt`;
            const className = file.name.split('~')[0] as keyof typeof CLASSES;
            const resized = sharp(buf).resize({
                width: SHAPE,
                height: SHAPE,
                fit: 'fill'
            }).jpeg();

            const { data } = await resized.clone().raw().toBuffer({ resolveWithObject: true });

            let lowestX = SHAPE;
            let highestX = 0;
            let highestY = 0;
            let lowestY = SHAPE;
            for (let y = 0; y < SHAPE; y++) {
                for (let x = 0; x < SHAPE; x++) {
                    const i = (y * SHAPE + x) * 3;
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const hasPixelInfo = [r, g, b].every((v) => v > 5);
                    if (hasPixelInfo) {
                        if (x < lowestX) lowestX = x;
                        if (x > highestX) highestX = x;
                        if (y < lowestY) lowestY = y;
                        if (y > highestY) highestY = y;
                    }
                }
            }
            const centerX = (lowestX + (highestX - lowestX) / 2) / SHAPE;
            const objectWidth = (highestX - lowestX) / SHAPE;
            const objectHeight = (highestY - lowestY) / SHAPE;
            const centerY = (lowestY + (highestY - lowestY) / 2) / SHAPE;

            await writeFile(
                `files/train/labels/tgrayscale${fileName}`,
                `${CLASSES[className]} ${centerX.toFixed(4)} ${centerY.toFixed(4)} ${objectWidth.toFixed(4)} ${objectHeight.toFixed(4)}`
            );
            await writeFile(
                `files/train/labels/tnoise${fileName}`,
                `${CLASSES[className]} ${centerX.toFixed(4)} ${centerY.toFixed(4)} ${objectWidth.toFixed(4)} ${objectHeight.toFixed(4)}`
            );
            await writeFile(
                `files/train/labels/tblur${fileName}`,
                `${CLASSES[className]} ${centerX.toFixed(4)} ${centerY.toFixed(4)} ${objectWidth.toFixed(4)} ${objectHeight.toFixed(4)}`
            );

            resized.clone().grayscale().jpeg({ quality: 100 }).toFile(`files/train/images/tgrayscale${file.name}`);
            resized.clone().linear([0.6, Math.random() * 0.6 + 0.7, 1], [20, Math.random() * 5 + 5, Math.random() * 50 + 10]).jpeg({ quality: 100 }).toFile(`files/train/images/tblur${file.name}`);
            resized.composite([
                {
                    input: "noise.png",
                    gravity: 'southwest',
                    blend: "add"
                }
            ]).jpeg({ quality: 100 }).toFile(`files/train/images/tnoise${file.name}`);
            console.log('done');
        });
    }

    return new Response('ok', { status: 201 });
};
