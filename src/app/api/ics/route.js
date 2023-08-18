import {NextResponse} from "next/server";
import systemConfig from "@/config/system.config";

export function GET(request) {
    const params = new URL(request.url).searchParams
    const {school_year, semester, secret_key} = Object.fromEntries(params);

    if (!secret_key) {
        return NextResponse.json({
            code: 401,
            message: '401 Unauthorized.'
        })
    }

    if (secret_key !== systemConfig.secret_key) {
        return NextResponse.json({
            code: 403,
            message: '403 Forbidden.'
        })
    }

    return NextResponse.json({
        code: 200,
        message: 'ok.'
    })

}