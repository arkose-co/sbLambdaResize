'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  signatureVersion: 'v4',
});
const Sharp = require('sharp');


const widths = [400, 800];

const promises = [];

exports.handler = function(event, context) {
    const key = event.Records[0].s3.object.key;
    const bucket = event.Records[0].s3.bucket.name;
    if(key.substring(0, 13) == 'bouldersPics/' || key.substring(0, 10) == 'zonesPics/') {

        widths.forEach((width) => {
            promises.push(
                S3.getObject({Bucket: bucket, Key: key}).promise()
                    .then(data => Sharp(data.Body)
                        .resize(width)
                        .toFormat('jpeg')
                        .toBuffer()
                    )
                    .then(buffer => S3.putObject({
                            Body: buffer,
                            Bucket: bucket,
                            ContentType: 'image/jpeg',
                            Key: width.toString()+'/'+key,
                        }).promise()
                    )
                    .catch(err => callback(err))
            )

        })

        Promise.all(promises).then(()  => context.done());
    }
}
