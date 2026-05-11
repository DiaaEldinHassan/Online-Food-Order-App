import {
  S3Client,
  PutObjectCommand,
  PutBucketPolicyCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../config";
import crypto from "node:crypto";
import path from "node:path";

const s3 = new S3Client({
  region: env.s3_region,
  credentials: {
    accessKeyId: env.s3_access_key,
    secretAccessKey: env.s3_secret_access_key,
  },
});

const publicUrl = (key: string) =>
  `https://${env.s3_bucket_name}.s3.${env.s3_region}.amazonaws.com/${key}`;

const generateFileName = (prefix: string, originalName: string) => {
  const ext = path.extname(originalName);
  return `${prefix}/${crypto.randomBytes(16).toString("hex")}-${Date.now()}${ext}`;
};

export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  const key = generateFileName("uploads", file.originalname);

  const command = new PutObjectCommand({
    Bucket: env.s3_bucket_name,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,

  });

  await s3.send(command);
  return publicUrl(key);
};

export const ensureBucketPublicRead = async () => {
  try {
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicReadGetObject",
          Effect: "Allow",
          Principal: "*",
          Action: "s3:GetObject",
          Resource: `arn:aws:s3:::${env.s3_bucket_name}/*`,
        },
      ],
    };

    const command = new PutBucketPolicyCommand({
      Bucket: env.s3_bucket_name,
      Policy: JSON.stringify(policy),
    });

    await s3.send(command);
    console.log("✅ S3 bucket public-read policy applied");
  } catch (error: any) {
    if (error.name === "MalformedPolicy" || error.name === "AccessDenied") {
      console.warn("⚠️  Cannot set S3 bucket policy — you may need to set it manually in AWS Console:");
      console.warn(`   Bucket: ${env.s3_bucket_name}`);
      console.warn("   Policy: { Version: '2012-10-17', Statement: [{ Sid: 'PublicReadGetObject', Effect: 'Allow', Principal: '*', Action: 's3:GetObject', Resource: 'arn:aws:s3:::<bucket>/*' }] }");
    } else {
      console.warn(`⚠️  S3 bucket policy error: ${error.message}`);
    }
  }
};

export const generatePresignedUploadUrl = async (
  prefix: string,
  originalName: string,
  contentType: string
): Promise<{ presignedUrl: string; key: string; publicUrl: string }> => {
  const key = generateFileName(prefix, originalName);

  const command = new PutObjectCommand({
    Bucket: env.s3_bucket_name,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(s3, command, {
    expiresIn: env.s3_expiry || 120,
    unhoistableHeaders: new Set(["x-amz-checksum-crc32", "x-amz-sdk-checksum-algorithm"]),
  });

  return { presignedUrl, key, publicUrl: publicUrl(key) };
};
