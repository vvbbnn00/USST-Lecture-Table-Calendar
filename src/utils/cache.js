export function getCacheFunc() {
    const nullAsyncFunc = async () => {
        return null
    };
    const {getCache, setCache} = process.env.NEXT_RUNTIME === 'nodejs' ? require('@/utils/redis') : {
        getCache: nullAsyncFunc,
        setCache: nullAsyncFunc
    };

    return {getCache, setCache}
}