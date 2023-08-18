import axios from 'axios';
import {JSDOM} from 'jsdom';
import {CookieJar} from 'tough-cookie';
import {wrapper} from 'axios-cookiejar-support';

wrapper(axios);

import apiConfig from "@/config/api.config";
import loginConfig from "@/config/login.config";

class Ids6_Login {
    constructor() {
        const cookieJar = new CookieJar();
        this.realName = null;
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

    async checkNeedCaptcha(username) {
        const requestUrl = `${loginConfig.ids.needCaptchaUrl}?username=${username}&_=${Date.now()}`;
        try {
            const response = await this.session.get(requestUrl, {
                headers: this.header,
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            console.error(error);
            throw new Error('查询是否需要验证码失败');
        }
    }

    async login(username, password, captchaResponse = null) {
        try {
            const pageResponse = await this.session.get(loginConfig.ids.loginUrl, {
                headers: this.header,
                withCredentials: true,
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

            const dom = new JSDOM(pageResponse.data);
            const inputList = dom.window.document.querySelectorAll('input');
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

            try {
                const response = await this.session.post(loginConfig.ids.loginUrl, new URLSearchParams(data).toString(), {
                    headers: this.header,
                    withCredentials: true,
                });

                const msgElement = new JSDOM(response.data).window.document.querySelector('#msg');
                if (msgElement) {
                    if (msgElement.textContent.includes('无效的验证码')) {
                        throw new Error('验证码错误');
                    }
                }

                const realNameElement = new JSDOM(response.data).window.document.querySelector('.auth_username');
                if (!realNameElement) {
                    throw new Error('登录失败，未找到姓名字段');
                }

                this.realName = realNameElement.textContent.replace(/\n|\r|\s/g, '');
                return [this.realName, this.cookieJar];
            } catch (error) {
                console.error(error);
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async loginIntoJwgl(username, password) {
        const [realName, cookieJar] = await this.login(username, password);
        const ret = await this.session.get(loginConfig.ids.jwglUrl, {
            jar: cookieJar,
            withCredentials: true,
            beforeRedirect: (config) => {
                // 如果不是https，则重定向到https
                if (config.hostname === 'jwgl.usst.edu.cn') {
                    if (config.href.startsWith('http://')) {
                        config.href = config.href.replace('http://', 'https://')
                    }
                    if (config.protocol !== 'https:') {
                        config.protocol = 'https:'
                    }
                }
            }
        });
        try {
            const userInfo = await this.session.get(loginConfig.jwgl.loginCheckUrl, {
                responseType: 'json',
            })
            if (!userInfo.data['xm']){
                throw new Error('教务管理系统登录失败');
            }
            return [realName, cookieJar, userInfo.data];
        } catch (e) {
            console.error(e);
            throw new Error('教务管理系统登录失败');
        }
    }

    async getCaptcha() {
        try {
            const response = await this.session.get(loginConfig.ids.captchaUrl, {
                params: {
                    ts: Math.floor(Date.now() / 1000),
                },
                headers: this.header,
                withCredentials: true,
                responseType: 'arraybuffer',
            });

            // 转为base64
            return Buffer.from(response.data, 'binary').toString('base64')
        } catch (error) {
            console.error(error);
            throw new Error('获取验证码失败');
        }
    }

    async solveCaptcha(captchaImg) {
        try {
            const response = await this.session.post(apiConfig.captcha.ids, captchaImg, {
                headers: {
                    'Content-Type': 'text/plain',
                }
            })
            return response.data;
        } catch (error) {
            console.error(error);
            throw new Error('验证码识别失败');
        }
    }
}

export default Ids6_Login;
