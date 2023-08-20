import Redis from 'ioredis'
import systemConfig from '@/config/system.config'

// 可在此处申请免费REDIS服务器：https://upstash.com/
const kv = new Redis(systemConfig.redis.url)
const prefix = systemConfig.redis.prefix

/**
 * 判断缓存是否存在
 * @param key
 * @returns {Promise<number>}
 */
export async function existsCache(key) {
    return kv.exists(prefix + key);
}

/**
 * 获取缓存
 * @param key
 * @returns {Promise<awaited any>}
 */
export async function getCache(key) {
    if (!key) {
        return null;
    }
    return kv.get(prefix + key);
}

/**
 * 设置缓存
 * @param key
 * @param value
 * @param expire
 * @returns {Promise<void>}
 */
export async function setCache(key, value, expire) {
    await kv.set(prefix + key, value, 'EX', expire);
}

/**
 * 删除缓存
 * @param key
 * @returns {Promise<void>}
 */
export async function delCache(key) {
    await kv.del(prefix + key);
}