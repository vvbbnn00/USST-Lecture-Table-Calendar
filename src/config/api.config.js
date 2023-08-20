// API 配置信息

module.exports = {
    // 验证码识别 API，基于项目 https://greasyfork.org/zh-CN/scripts/449888-usst-%E9%AA%8C%E8%AF%81%E7%A0%81%E8%AF%86%E5%88%AB-%E6%94%AF%E6%8C%81ids%E8%BA%AB%E4%BB%BD%E8%AE%A4%E8%AF%81-vpn%E7%B3%BB%E7%BB%9F%E5%92%8C%E6%95%99%E5%8A%A1%E7%AE%A1%E7%90%86%E7%B3%BB%E7%BB%9F
    captcha: {
        jwgl: 'https://wlkcard.slact.cn/ai/captcha/default',
        ids: 'https://wlkcard.slact.cn/ai/captcha/ids'
    },
    // 学期及放假调休安排 API
    time_info: 'https://vvbbnn00.github.io/USST-Lecture-Table-Calendar/date_config.json',
    // 课程表 API
    course_table: 'https://jwgl.usst.edu.cn/jwglxt/kbcx/xskbcx_cxXsgrkb.html?gnmkdm=N2151',
    // API 请求头
    edge_user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36 Edg/96.0.1054.62"
}