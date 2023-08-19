import {NextResponse} from "next/server";
import systemConfig from "@/config/system.config";
import {getCachedLectureTable, getTimeInformation} from "@/utils/information";
import {generateIcsFile} from "@/utils/lecture_table";

export async function GET(request) {
    const params = new URL(request.url).searchParams
    const timeInfo = await getTimeInformation();
    let {school_year, semester, secret_key} = Object.fromEntries(params);

    if (secret_key !== systemConfig.secret_key) {
        return NextResponse.json({
            code: 401,
            message: '401 Unauthorized.'
        })
    }

    school_year = school_year || timeInfo.currentSchoolYear
    semester = semester || timeInfo.currentSemester

    try {
        const lectureTable = await getCachedLectureTable(school_year, semester);
        if (!lectureTable) {
            return NextResponse.json({
                code: 404,
                message: 'Cannot get lecture table.'
            })
        }
        const filename = `${lectureTable.studentName}的${timeInfo.schoolYearMap[school_year]}${timeInfo.semesterMap[semester]}课程表.ics`;
        const icsObj = await generateIcsFile(lectureTable);
        icsObj.error && console.log(icsObj.error)

        return new Response(icsObj.value, {
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `attachment; filename=${encodeURIComponent(filename)}`,
            }
        })
    } catch (e) {
        console.log(e)
        return NextResponse.json({
            code: 500,
            message: 'Internal Server Error.',
            error: e
        })
    }

}

