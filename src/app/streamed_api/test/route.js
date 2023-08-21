import loginConfig from "@/config/login.config";

export const runtime = 'edge'

export async function GET(){
    let name, cookieJar, stuInfo;

    switch (loginConfig.loginMethod) {
        case 'jwgl':
            const Jwgl_Login = require('@/utils/jwgl_login').default;
            const jwgl = new Jwgl_Login();
            [name, cookieJar, stuInfo] = await jwgl.login(loginConfig.jwgl.params.username, loginConfig.jwgl.params.password);
            break;
        case 'ids':
            const Ids6_Login = require('@/utils/ids6_login').default;
            const ids6 = new Ids6_Login();
            [name, cookieJar, stuInfo] = await ids6.loginIntoJwgl(loginConfig.ids.params.username, loginConfig.ids.params.password);
            break;
        default:
            throw new Error('未知登录方式');
    }

    console.log(name, cookieJar, stuInfo)

    return new Response('Hello World!')
}