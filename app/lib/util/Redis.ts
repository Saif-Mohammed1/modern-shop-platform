import AppError from "@/app/lib/util/appError";
import { Redis } from "@upstash/redis";

const existingEnv = () => {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    throw new AppError(
      "Please provide UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in the environment variables",
      500
    );
  }
  return {
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  };
};

export const redis = new Redis({
  url: existingEnv().url,
  token: existingEnv().token,
});
