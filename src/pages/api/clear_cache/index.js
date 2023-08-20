import {delCache} from "@/utils/redis";
import {authCheckMiddleware} from "@/utils/middleware";

/**
 * 清除课程表缓存
 * @returns {Promise<void>}
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.status(405).json({
            code: 405,
            message: 'Method Not Allowed.'
        })
        return
    }

    // 鉴权
    const auth = await authCheckMiddleware(req);
    if (auth) {
        res.status(auth.code).json(auth);
        return
    }

    let {school_year, semester} = req.query;
    if (!school_year || !semester) {
        res.status(400).json({
            code: 400,
            message: 'Bad Request.'
        })
        return
    }

    delCache(`LECTURE_TABLE:${school_year}:${semester}`).then(r => {
        console.log(`清除${school_year}学年${semester}学期课程表缓存成功`)
    })

    res.status(200).json({
        code: 200,
        message: 'ok.'
    })
}