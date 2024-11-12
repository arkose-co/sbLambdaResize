'use strict';

import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import Sharp from 'sharp';
import { Readable } from 'stream';

const s3Client = new S3Client({ region: 'eu-west-1' }); // Specify your AWS region
const widths = [400, 800];

export const handler = async function(event, context) {
    const key = event.Records[0].s3.object.key;
    const bucket = event.Records[0].s3.bucket.name;

    if (key.startsWith('bouldersPics/') || key.startsWith('zonesPics/')) {
        try {
            const promises = widths.map(async (width) => {
                // Get the object from S3
                const getObjectCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
                const { Body } = await s3Client.send(getObjectCommand);

                // Convert the stream to a buffer
                const streamToBuffer = async (stream) => {
                    return new Promise((resolve, reject) => {
                        const chunks = [];
                        stream.on('data', (chunk) => chunks.push(chunk));
                        stream.on('end', () => resolve(Buffer.concat(chunks)));
                        stream.on('error', reject);
                    });
                };

                const imageBuffer = await streamToBuffer(Body);

                // Resize the image using Sharp
                const buffer = await Sharp(imageBuffer)
                    .resize(width)
                    .toFormat('jpeg')
                    .toBuffer();

                // Put the resized image back to S3
                const putObjectCommand = new PutObjectCommand({
                    Body: buffer,
                    Bucket: bucket,
                    ContentType: 'image/jpeg',
                    Key: `${width}/${key}`,
                });

                await s3Client.send(putObjectCommand);
            });

            await Promise.all(promises);
            context.succeed('Images processed successfully');
        } catch (err) {
            console.error('Error processing images:', err);
            context.fail('Failed to process images');
        }
    } else {
        context.succeed('No processing needed for this image');
    }
};
