import {NextResponse} from "next/server";

export async function GET() {
    return NextResponse.json({
        code: 404,
        message: '404 Not Found.'
    })
}