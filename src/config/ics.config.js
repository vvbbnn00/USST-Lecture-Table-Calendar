// 日历文件配置信息

export default {
    // 是否开启提醒功能，对应环境变量 ENABLE_REMINDER
    enableReminder: process.env.ENABLE_REMINDER || false,
    // 提前多少分钟提醒，对应环境变量 REMINDER_MINUTES
    reminderMinutes: Number(process.env.REMINDER_MINUTES) || 15,
}