"use client"

import {useRef, useState} from 'react';
import {QRCodeSVG} from "qrcode.react";
import {useClipboard} from 'use-clipboard-copy'
import toast, {Toaster} from 'react-hot-toast';

import {
    Box,
    Heading,
    TextField,
    Text,
    Flex,
    Select,
    Button,
    Link,
    Checkbox,
    Grid,
    Separator, Code
} from '@radix-ui/themes';
import {BookmarkIcon, CopyIcon, Link1Icon, LockClosedIcon} from "@radix-ui/react-icons";

export default function Home({schoolYearMap, semesterMap, currentSchoolYear, currentSemester}) {

    const [secretKey, setSecretKey] = useState('');
    const [schoolYear, setSchoolYear] = useState(currentSchoolYear);
    const [semester, setSemester] = useState(currentSemester);
    const [latest, setLatest] = useState(true);
    const [link, setLink] = useState('');
    const [maskedLink, setMaskedLink] = useState('');
    const [textLink, setTextLink] = useState('');
    const qrcodeRef = useRef(null);
    const clipboard = useClipboard();

    const
        handleGenerateLink = () => {
            const baseLink = `${window.location.protocol}//${window.location.host}/api/ics`;
            const params = new URLSearchParams();
            params.append('secret_key', secretKey);
            if (!latest) {
                params.append('school_year', schoolYear);
                params.append('semester', semester);
            }
            setLink(`${baseLink}?${params.toString()}`);
            params.set('secret_key', '********');
            setMaskedLink(`${baseLink}?${params.toString()}`);
            setTextLink(`${baseLink}?${params.toString()}`);
        };

    return (
        <main className={"w-9/12 m-auto mt-10 lg:w-7/12 xl:w-5/12"}>
            <Toaster/>
            <Heading
                as="h1"
                className={"mb-4 rt-r-size-8"}
            >USST Lecture Table Calendar</Heading>
            <Text as="div" className={"pt-5 pb-5 w-fit "}>
                在此页面输入您预先设置的<Code>安全密钥</Code>，并选择课表的学期，点击<Code>生成订阅链接</Code>
                以获得课表的日历链接，手机扫码或复制即可获得相应日历文件。通过该链接获得的课表将<strong>时刻保持更新</strong>。
            </Text>

            <Box className={"p-3 backdrop-blur bg-gray-50 border-2 rounded mb-5"}>
                <Flex direction="column" gap="3" className="mb-4">
                    <TextField.Root>
                        <TextField.Slot>
                            <LockClosedIcon height="16" width="16"/>
                        </TextField.Slot>
                        <TextField.Input
                            placeholder={'安全密钥'}
                            type="password"
                            value={secretKey}
                            onChange={(e) => {
                                setSecretKey(e.target.value);
                            }}/>
                    </TextField.Root>

                    <Flex>
                        <Text size="2">
                            <label>
                                <Checkbox mr="1" defaultChecked={latest} onClick={() => {
                                    setLatest(!latest);
                                }}/> 始终使用最新课表
                            </label>
                        </Text>
                    </Flex>


                    {!latest && (
                        <Grid columns="2" gap="3" width="auto">

                            <Select.Root
                                onValueChange={(e) => {
                                    setSchoolYear(e);
                                }}
                                value={schoolYear}
                            >
                                <Select.Trigger placeholder="选择学年"/>
                                <Select.Content>
                                    {Object.keys(schoolYearMap).map((key) => (
                                        <Select.Item key={key} value={key}>{schoolYearMap[key]}</Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>

                            <Select.Root
                                onValueChange={(e) => {
                                    setSemester(e);
                                }}
                                value={semester}
                            >
                                <Select.Trigger placeholder="选择学期"/>
                                <Select.Content>
                                    {Object.keys(semesterMap).map((key) => (
                                        <Select.Item key={key} value={key}>{semesterMap[key]}</Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>
                        </Grid>
                    )}

                    <Button
                        onClick={handleGenerateLink}
                        variant="surface"
                    >
                        <BookmarkIcon width="16" height="16"/> 生成订阅链接
                    </Button>
                </Flex>
            </Box>

            {link && (
                <Box className={"p-3 backdrop-blur bg-gray-50 border-2 rounded mb-5"}>
                    <TextField.Root>
                        <TextField.Slot>
                            <Link1Icon height="16" width="16"/>
                        </TextField.Slot>
                        <TextField.Input
                            placeholder={'订阅链接'}
                            type="text"
                            value={textLink}
                            onFocus={(e) => setTextLink(link)}
                            onBlur={(e) => setTextLink(maskedLink)}
                            readOnly/>
                        <TextField.Slot>
                            <Button
                                onClick={() => {
                                    clipboard.copy(link);
                                    toast.success('复制成功');
                                }}
                                size={"1"}
                                variant="ghost"
                                color="gray"
                                className={"mr-5"}
                            >
                                <CopyIcon height={16} width={16}></CopyIcon>
                            </Button>
                        </TextField.Slot>
                    </TextField.Root>
                    <Box
                        className={"m-2 flex items-center justify-center mt-5 cursor-pointer"}
                        onClick={() => {
                            window.open(link);
                        }}
                    >
                        <QRCodeSVG value={link} size="250" fgColor="#000" ref={qrcodeRef}/>
                    </Box>
                </Box>
            )}


            <footer className={"mt-10 mb-5"}>
                <Separator my="3" size="4"/>
                <Text as={"div"}>
                    Powered by{' '}
                    <Link href="#" className="underline">usst-lecture-table-calendar</Link>
                </Text>
                <Text>
                    Made with ❤️ by{' '}
                    <Link href="https://github.com/vvbbnn00" className="underline">vvbbnn00</Link>
                </Text>
            </footer>
        </main>
    );
}

