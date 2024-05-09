import type { RequestHandler } from './$types';
import { writeFile } from 'node:fs/promises';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { CHANNELS, CLASSES, SHAPE } from './constants';
import { db } from '$lib/server';
import { assemblyTable } from '$lib/server/schema';

export const POST: RequestHandler = async ({ request }) => {
	const form = await request.formData();
	const trainOnly = form.get('trainOnly') as string | null;
	const files = form.getAll('file') as File[];
	const assemblies = await db.select().from(assemblyTable);
	console.log('QUERY', assemblies);
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
					sigma: 400
				}
			}
		})
			.negate()
			.toFile('noise.png');
	}
	console.log(files[0].name);

	files.forEach(async (f) => {
		const file = sharp(await f.arrayBuffer());
		const { data, info } = await file
			.resize({ width: SHAPE, height: SHAPE, fit: 'cover' })
			.raw()
			.toBuffer({ resolveWithObject: true });
		console.log(info);
		const fileName = `${f.name.split('.')[0]}.txt`;
		const className = f.name.split('~')[0] as keyof typeof CLASSES;
		if (trainOnly) {
			console.log('train Only');
			for (let y = 0; y < SHAPE; y++) {
				for (let x = 0; x < SHAPE; x++) {
					const i = (y * SHAPE + x) * CHANNELS; //since handling .png and it has 4 channels
					const r = data[i];
					const g = data[i + 1];
					const b = data[i + 2];
					const a = data[i + 3];
					data[i + 3] = [r, g, b].some((v) => v > 22) ? a : 0x0;
				}
			}
		}

		const resized = sharp(Buffer.from(data), {
			raw: {
				width: SHAPE,
				height: SHAPE,
				channels: 4
			}
		})
			.toFormat('png')
			.flatten();

		if (!trainOnly) {
			await resized.toFile(`files/valid/images/v${f.name}`);
		}

		let lowestX = SHAPE;
		let highestX = 0;
		let highestY = 0;
		let lowestY = SHAPE;
		for (let y = 0; y < SHAPE; y++) {
			for (let x = 0; x < SHAPE; x++) {
				const i = (y * SHAPE + x) * CHANNELS;
				const r = data[i];
				const g = data[i + 1];
				const b = data[i + 2];
				const hasPixelInfo = [r, g, b].every((v) => v > 6);
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

		const trainNames = ['grayscale', 'noise', 'linear'];
		for (let i = 0; i < trainNames.length; i++) {
			await writeFile(
				`files/train/labels/t${trainNames[i]}${fileName}`,
				`${CLASSES[className]} ${centerX.toFixed(4)} ${centerY.toFixed(
					4
				)} ${objectWidth.toFixed(4)} ${objectHeight.toFixed(4)}`
			);
		}
		await writeFile(
			`files/valid/labels/v${fileName}`,
			`${CLASSES[className]} ${centerX.toFixed(4)} ${centerY.toFixed(
				4
			)} ${objectWidth.toFixed(4)} ${objectHeight.toFixed(4)}`
		);

		if (trainOnly) {
			const isBackChanged = Math.round(Math.random());
			const start = sharp(Buffer.from(data), {
				raw: { width: SHAPE, height: SHAPE, channels: CHANNELS }
			});
			if (isBackChanged) {
				start.flatten({
					background: {
						r: 120 + Math.random() * 135,
						g: 120 + Math.random() * 135,
						b: 120 + Math.random() * 135
					}
				});
			} else {
				const hasWhiteBg = Math.round(Math.random());
				start
					.tint({
						r: 120 + Math.random() * 135,
						g: 120 + Math.random() * 135,
						b: 120 + Math.random() * 135
					})
					.flatten({
						background: {
							r: hasWhiteBg ? 255 : 0,
							g: hasWhiteBg ? 255 : 0,
							b: hasWhiteBg ? 255 : 0
						}
					});
			}
			start.toFormat('png').toFile(`files/train/images/trandcolor${f.name}`);
		}

		resized
			.clone()
			.grayscale()
			.png({ quality: 100 })
			.toFile(`files/train/images/tgrayscale${f.name}`);
		resized
			.clone()
			.linear(
				[0.6, Math.random() * 0.6 + 0.7, 1],
				[20, Math.random() * 5 + 5, Math.random() * 50 + 10]
			)
			.png({ quality: 100 })
			.toFile(`files/train/images/tlinear${f.name}`);
		resized
			.composite([
				{
					input: 'noise.png',
					gravity: 'southwest',
					blend: 'add'
				}
			])
			.png({ quality: 100 })
			.toFile(`files/train/images/tnoise${f.name}`);
	});

	console.log('done');
	return new Response('ok', { status: 201 });
};
