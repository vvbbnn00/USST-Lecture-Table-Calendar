import systemConfig from "@/config/system.config"
import requestIp from 'request-ip'
const {getCache, setCache} = require('@/utils/redis')

/**
 * 鉴权函数，判断是否有权限访问
 * @param request 请求
 */
async function isAuthenticated(request) {
    // 请求频率限制
    const ip = requestIp.getClientIp(request)
    const key = `API_RATE_LIMIT:${btoa(String(ip))}`;

    // 判断是否频率限制
    const isLimited = await getCache(key);
    if (isLimited) {
        return {
            'ip': ip,
            'code': 429,
        };
    }

    // 判断是否有secret_key，secret_key可以在请求头中传递，也可以在请求参数中传递
    const secret_key = request.headers['x-secret-key'] || request.query['secret_key'];

    // 如果secret_key不正确，且ip不为空，则进行频率限制
    if (secret_key !== systemConfig.secretKey && ip) {
        setCache(key, 1, systemConfig.rateLimit).then(() => {});
    }

    // 判断secret_key是否正确
    return {
        'ip': ip,
        'code': secret_key === systemConfig.secretKey ? 200 : 401,
    };
}

export async function authCheckMiddleware(request) {
    const auth = await isAuthenticated(request);

    switch (auth.code) {
        case 200:
            return null;
        case 401:
            return {
                code: 401,
                message: 'Unauthorized',
            }
        case 429:
            return {
                code: 429,
                message: 'Too Many Requests',
            }
    }
}