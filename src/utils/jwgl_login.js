import makeFetchCookie from 'fetch-cookie'
import DomParser from 'dom-parser';

import apiConfig from "@/config/api.config";
import loginConfig from "@/config/login.config";


class Jwgl_Login {
    constructor() {
        const cookieJar = new makeFetchCookie.toughCookie.CookieJar(null);
        this.fetch = makeFetchCookie(fetch, cookieJar);
        this.cookieJar = cookieJar;
        this.header = {
            'User-Agent': apiConfig.edge_user_agent,
            'Content-Type': 'application/x-www-form-urlencoded',
        };
    }

    /**
     * 登录
     * @param username
     * @param password
     * @returns {Promise<(*|CookieJar)[]>}
     */
    async login(username, password) {
        const loginPage = await this.fetch(loginConfig.jwgl.loginUrl, {
            headers: this.header,
            method: 'GET',
            cache: 'no-cache',
        });
        const dom = new DomParser().parseFromString(await loginPage.text());

        const requestForm = {
            csrftoken: dom.getElementById('csrftoken').getAttribute("value"),
            language: dom.getElementById('language').getAttribute("value"),
            yhm: username,
            mm: password,
            agree: 1
        };

        const ret = await this.fetch(`${loginConfig.jwgl.loginUrl}?time=${Date.now()}`,
            {
                headers: this.header,
                method: 'POST',
                body: new URLSearchParams(requestForm),
                cache: 'no-cache',
                credentials: 'include',
                redirect: 'manual',
            });

        // console.log(await ret.text(), ret.headers.get('set-cookie'))
        this.cookieJar.removeAllCookies()
        ret.headers.get('set-cookie').split(',').forEach((cookie) => {
            try{this.cookieJar.setCookieSync(cookie.trim().split(';')[0], loginConfig.jwgl.baseUrl);}
            catch (e) {}
        })
        // console.log(this.cookieJar.getCookieStringSync(loginConfig.jwgl.loginCheckUrl))

        try {
            const userInfo = await (await this.fetch(loginConfig.jwgl.loginCheckUrl, {
                headers: this.header,
                method: 'GET',
                cache: 'no-cache',
            })).json();

            if (!userInfo['xm']) {
                throw new Error('未找到姓名，登录失败');
            }
            return [userInfo['xm'], this.cookieJar, userInfo]
        } catch (error) {
            console.error(error);
            throw new Error('教务系统登录失败');
        }
    }
}

export default Jwgl_Login;