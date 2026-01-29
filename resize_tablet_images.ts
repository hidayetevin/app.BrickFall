import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';

async function processImages() {
    const dir = 'store_assets/tablet_10';
    if (!fs.existsSync(dir)) {
        console.error("Directory not found:", dir);
        return;
    }

    const files = fs.readdirSync(dir);

    for (const file of files) {
        if (!file.endsWith('.png')) continue;

        const filePath = path.join(dir, file);
        console.log(`Processing ${file}...`);

        try {
            // Read the image
            const image = await Jimp.read(filePath);

            // Google Play 10-inch tablet requirement:
            // "Sides between 1080 and 7680 px"
            // "16:9 or 9:16 aspect ratio"

            // We will resize to Standard HD Portrait: 1080x1920 (9:16)
            // Using 'cover' strategy to fill the area without stretching distortion if aspect ratio differs,
            // or force resize if we want exact 1080x1920.
            // Since our source might be varying, simple resize to 1080x1920 ensures technical compliance.

            image.resize({ w: 1080, h: 1920 });

            // Save overwriting the file
            await image.write(filePath);
            console.log(`✅ Resized ${file} to 1080x1920`);
        } catch (err) {
            console.error(`❌ Error processing ${file}:`, err);
        }
    }
}

processImages().catch(console.error);
