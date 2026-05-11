import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve("./src/config/.env.dev") });

export const env = {
  port: Number(process.env.PORT),
  db_uri: process.env.DB_URI as string,
  redis_url: process.env.REDIS_URL as string,
  access_sk: process.env.ACCESS_SECRET_KEY as string,
  refresh_sk: process.env.REFRESH_SECRET_KEY as string,
  salt: Number(process.env.SALT),
  encryption_sk: process.env.ENCRYPTION_SK as string,
  s3_region: process.env.S3_REGION as string,
  s3_bucket_name: process.env.S3_BUCKET_NAME as string,
  s3_access_key: process.env.S3_ACCESS_KEY as string,
  s3_secret_access_key: process.env.S3_SECRET_ACCESS_KEY as string,
  s3_expiry: Number(process.env.S3_EXPIRATION_TIME),
  nodemailer_account:process.env.NODEMAILER_ACCOUNT as string,
  nodemailer_password:process.env.NODEMAILER_PASSWORD as string,
  google_auth_client_id:process.env.GOOGLE_CLIENT_ID as string,
  app_name: process.env.APP_NAME as string,
  node_env: process.env.NODE_ENV as string,
};
