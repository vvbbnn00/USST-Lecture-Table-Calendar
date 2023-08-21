import {getCachedLectureTable, getTimeInformation} from "@/utils/information";
import {generateIcsFile} from "@/utils/lecture_table";
import {authCheckMiddleware} from "@/utils/middleware";

function iteratorToStream(iterator, headers) {
    return new ReadableStream({
            async pull(controller) {
                const {value, done} = await iterator.next()

                if (done) {
                    controller.close()
                } else {
                    controller.enqueue(value)
                }
            },
        })
}

const encoder = new TextEncoder()

async function* makeIterator(school_year, semester) {
    try {
        const lectureTable = await getCachedLectureTable(school_year, semester);
        if (!lectureTable) {
            yield encoder.encode(JSON.stringify({
                code: 404,
                message: 'Not Found.'
            }))
            return
        }
        const icsObj = await generateIcsFile(lectureTable);
        if (icsObj.error) {
            console.log(icsObj.error)
            yield encoder.encode(JSON.stringify({
                code: 500,
                message: 'Internal Server Error.',
                error: icsObj.error
            }))
            return
        }
        yield encoder.encode(icsObj.value)
    } catch (e) {
        console.log(e)
        // error 只返回到stack为止
        const err = {
            message: e.message,
            stack: e.stack
        }
        yield encoder.encode(JSON.stringify({
            code: 500,
            message: 'Internal Server Error.',
            error: err
        }))
    }
}

/**
 * 生成ics文件
 * @param req
 * @returns
 */
export async function GET(req) {
    if (req.method !== 'GET') {
        return new Response(JSON.stringify({
            code: 405,
            message: 'Method Not Allowed.'
        }), {
            status: 405,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            }
        })
    }

    // 鉴权
    const auth = await authCheckMiddleware(req);
    if (auth) {
        return new Response(JSON.stringify(auth), {
            status: auth.code,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            }
        })
    }

    const timeInfo = await getTimeInformation();
    let {school_year, semester} = (new URL(req.url)).searchParams;

    school_year = school_year || timeInfo.currentSchoolYear
    semester = semester || timeInfo.currentSemester

    // school_year须在schoolYearMap中，semester须在semesterMap中
    if (!timeInfo.schoolYearMap[school_year] || !timeInfo.semesterMap[semester]) {
        return new Response(JSON.stringify({
            code: 400,
            message: 'Invalid school_year or semester.'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            }
        })
    }

    const filename = `${timeInfo.schoolYearMap[school_year]}${timeInfo.semesterMap[semester]}课程表.ics`;
    const headers = {
        'Content-Disposition': `attachment; filename="${encodeURI(filename)}"`,
        'Content-Type': 'text/calendar; charset=utf-8',
    }

    const iterator = makeIterator(school_year, semester)
    const stream = iteratorToStream(iterator, headers)

    return new Response(stream, {
        status: 200,
        headers: headers
    })
}
