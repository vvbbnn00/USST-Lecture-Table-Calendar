import {createEvents, ReturnObject} from 'ics';
import {calcDate, calcTime, dateToArray} from "@/utils/datetime";
import {getTimeInformation} from "@/utils/information";
import icsConfig from "@/config/ics.config";

/**
 * 生成ics文件
 * @param data 课表数据
 * @returns {Promise<ReturnObject>}
 */
export async function generateIcsFile(data) {
    const {schoolYear: schoolYear, semester: semester, lectureTable: kbData} = data;
    const {semesterStartDateMap: SEMESTER_START_DATE_MAP} = await getTimeInformation()
    const reminderOffset = icsConfig.enableReminder ? icsConfig.reminderOffset : 0;

    const reminderAlarm = [{
        action: 'audio',
        description: '上课提醒',
        trigger: {seconds: reminderOffset, before: true},
    }]

    const events = [];

    const baseDate = new Date(SEMESTER_START_DATE_MAP[`${schoolYear}-${semester}`]);
    if (!baseDate) {
        throw new Error('未找到学期开始日期');
    }

    const kbList = [...kbData];

    // 处理多周次的情况
    kbData.forEach(lecture => {
        const zcList = lecture.zcd.split(",");
        if (zcList.length === 1) return;

        const index = kbList.indexOf(lecture);
        kbList.splice(index, 1);

        zcList.forEach(zc => {
            const newLecture = {...lecture, zcd: zc};
            kbList.push(newLecture);
        });
    });

    for (const lecture of kbList) {
        let zc = lecture.zcd.replace('周', '');
        let step = 1;

        // 处理单双周
        if (zc.includes('(双)') || zc.includes('(单)')) {
            step = 2;
            zc = zc.replace('(双)', '').replace('(单)', '');
        }

        const zcArr = zc.split('-');
        const dates = [];
        for (let i = parseInt(zcArr[0]); i <= parseInt(zcArr[1]); i += step) {
            dates.push(await calcDate(i, lecture['xqj'], baseDate));
        }

        const timeDelta = await calcTime(lecture['jcor'].split('-')[0], lecture['jcor'].split('-')[1]);
        dates.forEach(item => {
            if (item.isVacation) return;

            const event = {
                productId: 'USST-Lecture-Table-Calendar',
                start: dateToArray(new Date(item.datetimeObj.getTime() + timeDelta.start)),
                end: dateToArray(new Date(item.datetimeObj.getTime() + timeDelta.end)),
                title: lecture['kcmc'],
                description: `[${lecture['kcxz']} ${lecture['khfsmc']}]${lecture['kclb']} - ${lecture['kcmc']} 授课老师：${lecture['xm']}`,
                location: `${lecture['cdmc']},上海理工大学${lecture['xqmc']},上海市,中国`,
                categories: [lecture['kcxz'], lecture['khfsmc'], lecture['kclb']],
                status: 'CONFIRMED',
                organizer: {name: lecture['xm'], email: 'mail@mail.com'},
                attendees: [{name: data.studentName, email: data.schoolNumber + '@st.usst.edu.cn'}],
                alarms: reminderOffset > 0 ? reminderAlarm : [],
            };
            events.push(event);

        });
    }

    return createEvents(events);
}
