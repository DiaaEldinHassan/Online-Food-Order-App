
import { createClient } from "redis";
import { env } from "../config";
import { BadRequestError } from "../common";

export const client = createClient({ url: env.redis_url });

export async function redisConnect() {
    try {
        await client.connect()
        console.log("Redis DB Connected Successfully 👌👌")
    } catch (error) {
        throw new BadRequestError("Redis Connection Error")
    }
}