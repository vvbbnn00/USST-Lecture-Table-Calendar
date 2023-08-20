import {getCachedLectureTable, getTimeInformation} from "@/utils/information";
import {generateIcsFile} from "@/utils/lecture_table";
import {authCheckMiddleware} from "@/utils/middleware";

/**
 * 生成ics文件
 * @param req
 * @param res
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

    const timeInfo = await getTimeInformation();
    let {school_year, semester} = req.query;

    school_year = school_year || timeInfo.currentSchoolYear
    semester = semester || timeInfo.currentSemester

    // school_year须在schoolYearMap中，semester须在semesterMap中
    if (!timeInfo.schoolYearMap[school_year] || !timeInfo.semesterMap[semester]) {
        res.status(400).json({
            code: 400,
            message: 'Invalid school_year or semester.'
        })
        return
    }

    try {
        const lectureTable = await within(getCachedLectureTable, res, 9500, school_year, semester); // Vercel最大超时时间为10s，这里设置为9.5s
        if (!lectureTable) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Content-Disposition', 'inline');
            res.status(404).json({
                code: 404,
                message: 'Not Found.'
            })
            return
        }
        const filename = `${lectureTable.studentName}的${timeInfo.schoolYearMap[school_year]}${timeInfo.semesterMap[semester]}课程表.ics`;
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURI(filename)}"`);

        const icsObj = await generateIcsFile(lectureTable);

        // 生成失败的情况，返回错误信息
        if (icsObj.error) {
            console.log(icsObj.error)
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Content-Disposition', 'inline');
            res.status(500).json({
                code: 500,
                message: 'Internal Server Error.',
                error: icsObj.error
            });
            return
        }

        // 生成成功，返回ics文件
        res.send(icsObj.value)
    } catch (e) {
        console.log(e)
        // error 只返回到stack为止
        const err = {
            message: e.message,
            stack: e.stack
        }

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Disposition', 'inline');
        res.status(500).json({
            code: 500,
            message: 'Internal Server Error.',
            error: err
        })
    }
}


async function within(fn, res, duration, ...args) {
    const id = setTimeout(() => res.status(408).json({
        code: 408,
        message: "服务器正在处理中，请稍后再试"
    }), duration)

    try {
        let data = await fn(...args)
        clearTimeout(id)
        return data
    } catch (e) {
        throw e
    }
}