// Deportons la connection au S3

const { S3Client } = require("@aws-sdk/client-s3");
require("dotenv").config({ path: "../.env" });

const client = new S3Client({
  region: process.env.SCALEWAY_REGION,
  endpoint: process.env.SCALEWAY_ENDPOINT,
  credentials: {
    accessKeyId: process.env.SCALEWAY_ACCESS_KEY,
    secretAccessKey: process.env.SCALEWAY_SECRET_KEY,
  },
});

module.exports = client;
