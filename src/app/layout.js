import './globals.css'
import {Theme} from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';

export const metadata = {
    title: 'USST Lecture Table Calendar',
    description: '一键生成上海理工大学课程表日历，时刻保持更新',
}

export default async function RootLayout({children}) {
    return (
        <html lang="en">
        <body>
        <Theme>
            {children}
        </Theme>
        </body>
        </html>
    )
}

