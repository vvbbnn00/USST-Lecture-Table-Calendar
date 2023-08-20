import axios from 'axios';
import {JSDOM} from 'jsdom';
import {CookieJar} from 'tough-cookie';
import {wrapper} from 'axios-cookiejar-support';

wrapper(axios);

import apiConfig from "@/config/api.config";
import loginConfig from "@/config/login.config";

class Jwgl_Login {
    constructor() {
        const cookieJar = new CookieJar();
        this.session = axios.create({
            withCredentials: true,
            jar: cookieJar,
            headers: {
                'User-Agent': apiConfig.edge_user_agent,
            }
        });
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
        const loginPage = await this.session.get(loginConfig.jwgl.loginUrl);
        const dom = new JSDOM(loginPage.data);
        const soup = dom.window.document;

        const requestForm = {
            csrftoken: soup.querySelector("#csrftoken").getAttribute("value"),
            language: soup.querySelector("#language").getAttribute("value"),
            yhm: username,
            mm: password
        };

        const ret = await this.session.post(`${loginConfig.jwgl.loginUrl}?time=${Date.now()}`, requestForm,
            {
                headers: this.header,
            });

        try {
            const userInfo = await this.session.get(loginConfig.jwgl.loginCheckUrl, {
                responseType: 'json',
            })
            if (!userInfo.data['xm']) {
                throw new Error('未找到姓名，登录失败');
            }
            return [userInfo.data['xm'], this.cookieJar, userInfo.data]
        } catch (error) {
            console.error(error);
            throw new Error('登录失败');
        }
    }
}

export default Jwgl_Login;