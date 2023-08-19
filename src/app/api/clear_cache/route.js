import {getTimeInformation} from "@/utils/information";
import {NextResponse} from "next/server";
import systemConfig from "@/config/system.config";
import {delCache} from "@/utils/redis";

export async function GET(request) {
    const params = new URL(request.url).searchParams
    let {school_year, semester, secret_key} = Object.fromEntries(params);

    if (secret_key !== systemConfig.secret_key) {
        return NextResponse.json({
            code: 401,
            message: '401 Unauthorized.'
        })
    }

    if (!school_year || !semester) {
        return NextResponse.json({
            code: 400,
            message: '400 Bad Request. Missing school_year or semester.'
        });
    }

    delCache(`LECTURE_TABLE:${school_year}:${semester}`).then(r => {
        console.log(`清除${school_year}学年${semester}学期课程表缓存成功`)
    })

    return NextResponse.json({
        code: 200,
        message: 'ok.'
    })
}