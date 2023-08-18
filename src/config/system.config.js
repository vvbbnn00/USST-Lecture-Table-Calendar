// 系统配置信息

export default {
    // 安全密钥，强烈建议设置，对应环境变量 SECRET_KEY
    secret_key: process.env.SECRET_KEY || 'usst-lecture-table-calendar',
    // 课表信息缓存时间，单位为秒，对应环境变量 COURSE_TABLE_CACHE_TIME
    course_table_cache_time: Number(process.env.COURSE_TABLE_CACHE_TIME) || 3600,
    // 课表信息缓存文件路径，对应环境变量 COURSE_TABLE_CACHE_PATH
    course_table_cache_path: process.env.COURSE_TABLE_CACHE_PATH || './cache/',
    // REDIS 配置信息，对应环境变量 REDIS_URL, REDIS_PREFIX
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        prefix: process.env.REDIS_PREFIX || 'ULTC:'
    }
}