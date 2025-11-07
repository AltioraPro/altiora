import Redis from "ioredis";

import { env } from "@/env";

const redis = new Redis(`${env.REDIS_URL}?family=0`);

export default redis;
