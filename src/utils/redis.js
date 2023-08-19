import Redis from 'ioredis'
import systemConfig from '@/config/system.config'

// 可在此处申请免费REDIS服务器：https://upstash.com/
const kv = new Redis(systemConfig.redis.url)
const prefix = systemConfig.redis.prefix

export async function getCache(key) {
    const data = await kv.get(prefix + key);
    // console.log(data)
    return data;
}

export async function setCache(key, value, expire) {
    await kv.set(prefix + key, value, 'EX', expire);
}

export async function delCache(key) {
    await kv.del(prefix + key);
}