import makeFetchCookie from 'fetch-cookie'
import DomParser from 'dom-parser';

import apiConfig from "@/config/api.config";
import loginConfig from "@/config/login.config";

class Ids6_Login {
    constructor() {
        const cookieJar = new makeFetchCookie.toughCookie.CookieJar(null);
        this.fetch = makeFetchCookie(fetch, cookieJar);
        this.realName = null;
        this.cookieJar = cookieJar;
        this.header = {
            'User-Agent': apiConfig.edge_user_agent,
            'Content-Type': 'application/x-www-form-urlencoded',
        };
    }

    /**
     * 检查是否需要验证码
     * @param username
     * @returns {Promise<any>}
     */
    async checkNeedCaptcha(username) {
        const requestUrl = `${loginConfig.ids.needCaptchaUrl}?username=${username}&_=${Date.now()}`;
        try {
            const response = await this.fetch(requestUrl, {
                headers: this.header,
                method: 'GET',
                cache: 'no-cache',
            });
            return response.json();
        } catch (error) {
            console.error(error);
            throw new Error('查询是否需要验证码失败');
        }
    }

    /**
     * 登录
     * @param username
     * @param password
     * @param captchaResponse
     * @returns {Promise<CookieJar[]>}
     */
    async login(username, password, captchaResponse = null) {
        try {
            const pageResponse = await this.fetch(loginConfig.ids.loginUrl, {
                headers: this.header,
                method: 'GET',
                cache: 'no-cache',
            });
            const needCaptcha = await this.checkNeedCaptcha(username);

            if (needCaptcha && !captchaResponse) {
                const captchaImg = await this.getCaptcha();
                const captchaData = await this.solveCaptcha(captchaImg);

                if (captchaData.code !== 0) {
                    throw new Error('验证码识别失败');
                }

                captchaResponse = captchaData.result.toLowerCase();
            }

            const dom = new DomParser().parseFromString(await pageResponse.text());
            const inputList = dom.getElementsByTagName('input');
            let lt, dllt, execution, _eventId, rmShown;

            inputList.forEach((item) => {
                const name = item.getAttribute('name');
                if (!name) {
                    return;
                }

                switch (name) {
                    case 'lt':
                        lt = item.getAttribute('value');
                        break;
                    case 'dllt':
                        dllt = item.getAttribute('value');
                        break;
                    case 'execution':
                        execution = item.getAttribute('value');
                        break;
                    case '_eventId':
                        _eventId = item.getAttribute('value');
                        break;
                    case 'rmShown':
                        rmShown = item.getAttribute('value');
                        break;
                }
            });

            const data = {
                username,
                password,
                lt,
                dllt,
                execution,
                _eventId,
                rmShown,
            };

            if (captchaResponse) {
                data.captchaResponse = captchaResponse;
            }

            // console.log(this.cookieJar.getCookieStringSync(loginConfig.ids.loginUrl))

            try {
                const response = await this.fetch(loginConfig.ids.loginUrl, {
                    headers: this.header,
                    method: 'POST',
                    body: new URLSearchParams(data),
                    cache: 'no-cache',
                    credentials: 'include',
                    redirect: 'manual',
                });

                // console.log(response.headers.get('set-cookie'))
                response.headers.get('set-cookie').split(',').forEach((cookie) => {
                    try {
                        this.cookieJar.setCookieSync(cookie.trim().split(';')[0], loginConfig.ids.loginUrl);
                    } catch (e) {
                    }
                })
                // console.log(this.cookieJar.getCookieStringSync(loginConfig.ids.loginUrl))

                if (response.status !== 302) {
                    throw new Error('登录失败，未重定向');
                }

                const response1 = await this.fetch("https://ids6.usst.edu.cn/authserver/index.do", {
                    headers: this.header,
                    method: 'GET',
                    cache: 'no-cache',
                    credentials: 'include',
                });

                // console.log(await response1.text())

                const respDom = new DomParser().parseFromString(await response1.text());

                const realNameElement = respDom.getElementsByClassName('auth_username');
                if (!realNameElement) {
                    throw new Error('登录失败，未找到姓名字段');
                }

                this.realName = String(realNameElement[0].innerHTML).replace(/[\r|\n|\<span\>|\<\/span\>|\s]/g, "");
                return [this.realName, this.cookieJar];
            } catch (error) {
                console.error(error);
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * 登录教务管理系统
     * @param username
     * @param password
     * @returns {Promise<(CookieJar|any)[]>}
     */
    async loginIntoJwgl(username, password) {
        const [realName, cookieJar] = await this.login(username, password);
        let ret = await this.fetch(loginConfig.ids.jwglUrl, {
            headers: this.header,
            method: 'GET',
            cache: 'no-cache',
            credentials: 'include',
            redirect: 'manual',
        });

        // console.log(await ret.text())

        while (ret.status === 302) {
            let location = ret.headers.get('location');
            location = location.replace('http://jwgl.usst.edu.cn', 'https://jwgl.usst.edu.cn')
            if (location.startsWith('/')) {
                location = 'https://jwgl.usst.edu.cn' + location
            }

            ret = await this.fetch(location, {
                headers: this.header,
                method: 'GET',
                cache: 'no-cache',
                credentials: 'include',
                redirect: 'manual',
            });
            // console.log(ret.status, location)

            if (ret.headers.get('set-cookie') && location.startsWith('https://jwgl.usst.edu.cn/jwglxt/ticketlogin')) {
                this.cookieJar.removeAllCookies()
                ret.headers.get('set-cookie').split(',').forEach((cookie) => {
                    try {
                        this.cookieJar.setCookieSync(cookie.trim().split(';')[0], loginConfig.jwgl.baseUrl);
                    } catch (e) {
                    }
                });
            }
        }

        try {
            const userInfo = await (await this.fetch(loginConfig.jwgl.loginCheckUrl, {
                headers: this.header,
                method: 'GET',
                cache: 'no-cache',
                credentials: 'include',
            })).json();

            if (!userInfo['xm']) {
                throw new Error('教务管理系统登录失败');
            }
            return [realName, cookieJar, userInfo];
        } catch (e) {
            console.error(e);
            throw new Error('教务管理系统登录失败');
        }
    }

    /**
     * 获取验证码
     * @returns {Promise<string>}
     */
    async getCaptcha() {
        try {
            const response = await this.fetch(loginConfig.ids.captchaUrl + `?ts=${Math.floor(Date.now() / 1000)}`, {
                headers: this.header,
                method: 'GET',
                cache: 'no-cache'
            });

            // 转为base64
            return Buffer.from(await response.arrayBuffer()).toString('base64')
        } catch (error) {
            console.error(error);
            throw new Error('获取验证码失败');
        }
    }

    /**
     * 识别验证码
     * @param captchaImg
     * @returns {Promise<any>}
     */
    async solveCaptcha(captchaImg) {
        try {
            const response = await fetch(apiConfig.captcha.ids, {
                headers: {
                    'Content-Type': 'text/plain',
                },
                method: 'POST',
                body: captchaImg,
                cache: 'no-cache',
            })
            return response.json();
        } catch (error) {
            console.error(error);
            throw new Error('验证码识别失败');
        }
    }
}

export default Ids6_Login;
