// 日历文件配置信息

export default {
    // 是否开启提醒功能，对应环境变量 ENABLE_REMINDER
    enableReminder: process.env.ENABLE_REMINDER || true,
    // 提前多少秒提醒，对应环境变量 REMINDER_SECONDS
    reminderOffset: Number(process.env.REMINDER_SECONDS) || 15 * 60,
}