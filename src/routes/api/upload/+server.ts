import type { RequestHandler } from './$types';
import { writeFile } from 'node:fs/promises';
import fs from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import sharp from 'sharp';

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
    console.log(files[0].name);
    files.forEach(async (file) => {
        const buf = await file.arrayBuffer();
        const fileName = `${file.name.split('.')[0]}.txt`;
        const className = file.name.split('~')[0] as keyof typeof CLASSES;
        const { data, info } = await sharp(buf)
            .resize(800, 600)
            .raw()
            .toBuffer({ resolveWithObject: true });
        await writeFile(`files/train/labels/${fileName}`, '');
        await writeFile(`files/valid/labels/${fileName}`, '');
        const validFileStream = createWriteStream(`files/valid/labels/v${fileName}`);
        const trainFileStream = createWriteStream(`files/train/labels/t${fileName}`);
        let lowestX = 800;
        let highestX = 0;
        let highestY = 0;
        let lowestY = 600;
        for (let y = 0; y < 600; y++) {
            for (let x = 0; x < 800; x++) {
                const i = (y * 800 + x) * 3;
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
        const centerX = (lowestX + (highestX - lowestX) / 2) / 800;
        const objectWidth = (highestX - lowestX) / 800;
        const objectHeight = (highestY - lowestY) / 600;
        const centerY = (lowestY + (highestY - lowestY) / 2) / 600;
        validFileStream.write(
            `${CLASSES[className]}\t${centerX.toFixed(4)}\t${centerY.toFixed(4)}\t${objectWidth.toFixed(4)}\t${objectHeight.toFixed(4)}`
        );
        trainFileStream.write(
            `${CLASSES[className]}\t${centerX.toFixed(4)}\t${centerY.toFixed(4)}\t${objectWidth.toFixed(4)}\t${objectHeight.toFixed(4)}`
        );
        trainFileStream.end();
        validFileStream.end();
        const asValidFile = sharp(buf).resize(800, 600).jpeg({ quality: 100 });
        let asTrainFile: sharp.Sharp | undefined;
        const rand = Math.floor(Math.random() * 10);
        console.log(rand);
        if (rand < 3) {
            console.log('grayscale');
            asTrainFile = sharp(buf).resize(800, 600).grayscale().jpeg({ quality: 100 });
        } else if (rand >= 3 && rand < 5) {
            console.log('blur');
            asTrainFile = sharp(buf).resize(800, 600).blur(0.8).jpeg({ quality: 100 });
        } else if (rand >= 5 && rand < 8) {
            console.log('noising');
            await sharp({
                create: {
                    width: 800,
                    height: 600,
                    channels: 3,
                    background: {
                        r: 0,
                        g: 0,
                        b: 0
                    },
                    noise: {
                        type: 'gaussian',
                        mean: 1000,
                        sigma: 350
                    }
                }
            }).negate().toFile('noise.png');
            asTrainFile = sharp(buf)
                .resize(800, 600)
                .composite([{ input: 'noise.png', gravity: 'southwest', blend: "add" }]).jpeg({ quality: 100 });
        } else {
            console.log('sharpen');
            asTrainFile = sharp(buf).resize(800, 600).sharpen().jpeg({ quality: 100 });
        }
        await writeFile(`files/train/images/t${file.name}`, asTrainFile ?? asValidFile);
        await writeFile(`files/valid/images/v${file.name}`, asValidFile);
        console.log('done');
    });
    return new Response('ok', { status: 201 });
};
