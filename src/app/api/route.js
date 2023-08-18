import {NextResponse} from "next/server";
import Jwgl_Login from "@/utils/jwgl_login";
import Ids6_Login from "@/utils/ids6_login";
import loginConfig from "@/config/login.config";

export async function GET() {

    const jwgl = new Jwgl_Login();
    console.log(await jwgl.login(loginConfig.jwgl.params.username, loginConfig.jwgl.params.password))
    const ids6 = new Ids6_Login();
    console.log(await ids6.loginIntoJwgl(loginConfig.ids.params.username, loginConfig.ids.params.password))

    return NextResponse.json({
        code: 404,
        message: '404 Not Found.'
    })
}