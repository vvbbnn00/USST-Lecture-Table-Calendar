// 登录方式配置文件
// 请勿将用户名和密码直接写在此处，应使用环境变量获取

module.exports = {
    // 登录方式
    loginMethod: process.env.LOGIN_METHOD || 'jwgl', // jwgl: 教务管理系统登录, ids: 统一身份认证登录
    // 教务管理系统登录配置
    jwgl: {
        // 教务管理系统基础地址，用于设置 cookie
        baseUrl: 'https://jwgl.usst.edu.cn/jwglxt/',
        // 登录地址
        loginUrl: 'https://jwgl.usst.edu.cn/jwglxt/xtgl/login_slogin.html',
        // 查询是否登录成功的地址
        loginCheckUrl: 'https://jwgl.usst.edu.cn/jwglxt/xsxxxggl/xsxxwh_cxCkDgxsxx.html?gnmkdm=N100801',
        // 登录参数
        params: {
            // 环境变量获取，对应JWGL_USERNAME
            username: process.env.JWGL_USERNAME || '',
            // 环境变量获取，对应JWGL_PASSWORD
            password: process.env.JWGL_PASSWORD || '',
        }
    },
    // 统一身份认证登录配置
    ids: {
        // 登录地址
        loginUrl: 'https://ids6.usst.edu.cn/authserver/login',
        // 查询是否需要验证码的地址
        needCaptchaUrl: 'https://ids6.usst.edu.cn/authserver/needCaptcha.html',
        // 获取验证码的地址
        captchaUrl: 'https://ids6.usst.edu.cn/authserver/captcha.html',
        // 查询是否登录成功的地址
        loginCheckUrl: 'https://ids6.usst.edu.cn/authserver/index.do',
        // 进入教务管理系统的地址
        jwglUrl: 'https://jwgl.usst.edu.cn/sso/jziotlogin',
        // 登录参数
        params: {
            // 环境变量获取，对应IDS_USERNAME
            username: process.env.IDS_USERNAME || '',
            // 环境变量获取，对应IDS_PASSWORD
            password: process.env.IDS_PASSWORD || '',
        }
    }
}