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
    Separator,
    Code,
    AlertDialog,
    Strong,
    Callout,
    IconButton,
    Popover,
} from '@radix-ui/themes';
import {BookmarkIcon, CopyIcon, Link1Icon, LockClosedIcon, InfoCircledIcon, TrashIcon} from "@radix-ui/react-icons";

export default function Home({schoolYearMap, semesterMap, currentSchoolYear, currentSemester}) {

    const [secretKey, setSecretKey] = useState('');
    const [schoolYear, setSchoolYear] = useState(currentSchoolYear);
    const [semester, setSemester] = useState(currentSemester);
    const [latest, setLatest] = useState(true);
    const [useStreamed, setUseStreamed] = useState(true);
    const [link, setLink] = useState('');
    const [maskedLink, setMaskedLink] = useState('');
    const [textLink, setTextLink] = useState('');
    const [cacheButtonLoading, setCacheButtonLoading] = useState(false);
    const qrcodeRef = useRef();
    const clipboard = useClipboard();

    const
        handleGenerateLink = () => {
            const baseLink = `${window.location.protocol}//${window.location.host}/${useStreamed ? 'streamed_api' : 'api'}/ics`;
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

    const handleClearCache = () => {
        setCacheButtonLoading(true);
        const baseLink = `${window.location.protocol}//${window.location.host}/api/clear_cache`;
        const params = new URLSearchParams();
        params.append('secret_key', secretKey);
        if (!latest) {
            params.append('school_year', schoolYear);
            params.append('semester', semester);
        } else {
            params.append('school_year', currentSchoolYear);
            params.append('semester', currentSemester);
        }
        fetch(`${baseLink}?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            res.json().then(data => {
                if (data.code === 200) {
                    toast.success('清除缓存成功');
                } else {
                    toast.error('清除缓存失败: ' + data.message);
                }
            })
        }).catch(e => {
            toast.error('请求失败');
        }).finally(() => {
            setCacheButtonLoading(false);
        });
    }

    return (
        <main className={"w-9/12 m-auto mt-10 lg:w-7/12 xl:w-5/12"}>
            <Toaster/>
            <Heading
                as="h1"
                className={"mb-4 rt-r-size-8"}
            >USST Lecture Table Calendar</Heading>

            <Text as="div" className={"pt-5 pb-5 w-fit "}>
                在此页面输入您预先设置的<Code>安全密钥</Code>，并选择课表的学期，点击<Code>生成链接</Code>
                以获得课表的日历链接，手机扫码或复制即可获得相应日历文件。通过该链接获得的课表将<strong>时刻保持更新</strong>。
            </Text>

            <Callout.Root color="red" className={"mb-5"}>
                <Callout.Icon>
                    <InfoCircledIcon/>
                </Callout.Icon>
                <Callout.Text>
                    若您的服务器架设于校外，且您的服务器<Strong>未使用校园VPN</Strong>，则在
                    <Strong>当日23:00后</Strong>很可能<Strong>无法访问教务系统</Strong>！
                </Callout.Text>
            </Callout.Root>

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
                            onInput={(e) => {
                                setSecretKey(e.target.value);
                            }}
                            onKeyPressCapture={(e) => {
                                if (e.key === 'Enter') {
                                    handleGenerateLink();
                                }
                            }}
                        />
                    </TextField.Root>

                    <Grid columns={"2"} align={"center"} justify={"center"} gap={"3"}>
                        <Text size="2">
                            <label>
                                <Checkbox mr="1" defaultChecked={latest} onClick={() => {
                                    setLatest(!latest);
                                }}/> 始终使用最新课表
                            </label>
                        </Text>
                        <Text size={"2"}>
                            <label>
                                <Flex gap="1" align="center">
                                    <Checkbox mr="1" defaultChecked={useStreamed} onClick={() => {
                                        setUseStreamed(!useStreamed);
                                    }}/> 使用流式API {' '}

                                    <Popover.Root>
                                        <Popover.Trigger>
                                            <IconButton
                                                size={"1"}
                                                variant={"ghost"}
                                                color={"gray"}
                                            >
                                                <InfoCircledIcon width="16" height="16"/>
                                            </IconButton>
                                        </Popover.Trigger>
                                        <Popover.Content style={{width: 360}}>
                                            <Heading size={"3"}>使用流式API</Heading>
                                            <Text size={"1"}>
                                                根据<code>Vercel</code>官方文档，Vercel的<code>Serverless
                                                Functions</code>有
                                                <code>10s</code>的最大执行时间限制，因此，如果您的课表较大，可能会导致
                                                <code>Serverless Functions</code>执行超时，从而导致请求失败。为了解决这个问题，
                                                我们提供了<code>流式API</code>。流式API会允许执行最多<code>30s</code>，
                                                因此，在课表较大的情况下，建议您使用流式API。
                                            </Text>
                                        </Popover.Content>
                                    </Popover.Root>
                                </Flex>
                            </label>
                        </Text>
                    </Grid>


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

                    <Grid columns="2" gap="3" width="auto">
                        <Button
                            onClick={handleGenerateLink}
                            variant="surface"
                        >
                            <BookmarkIcon width="16" height="16"/> 生成链接
                        </Button>
                        {/* 清除缓存提示框 */}
                        <AlertDialog.Root>
                            <AlertDialog.Trigger>
                                <Button
                                    color="red"
                                    variant="surface"
                                    disabled={cacheButtonLoading}
                                >
                                    <TrashIcon width="16" height="16"/> 清除缓存
                                </Button>
                            </AlertDialog.Trigger>
                            <AlertDialog.Content style={{maxWidth: 450}}>
                                <AlertDialog.Title>清除缓存</AlertDialog.Title>
                                <AlertDialog.Description size="2">
                                    清除缓存操作只会清除您当前选定的学年学期的课表缓存，不会影响其他学年学期的课表缓存。
                                    <Strong>若您没有指定学年学期，则将清除当前学年学期的课表缓存。</Strong><br/>
                                    清除缓存需要您输入正确的<Code>安全密钥</Code>方可进行。<br/>
                                    清除缓存后，再次请求日历文件时，服务器将从教务系统更新课表，这可能需要一定时间。<br/>
                                    若您已经了解清除缓存的后果，点击<Code>确认</Code>以清除缓存。
                                </AlertDialog.Description>

                                <Flex gap="3" mt="4" justify="end">
                                    <AlertDialog.Cancel>
                                        <Button variant="soft" color="gray">
                                            取消
                                        </Button>
                                    </AlertDialog.Cancel>
                                    <AlertDialog.Action>
                                        <Button variant="solid" color="red" onClick={handleClearCache}>
                                            确认
                                        </Button>
                                    </AlertDialog.Action>
                                </Flex>
                            </AlertDialog.Content>
                        </AlertDialog.Root>
                    </Grid>

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
                            <IconButton
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
                            </IconButton>
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

                    <Text className={"mt-5 text-sm"}>
                        * 点击二维码即可下载日历文件
                    </Text>
                </Box>
            )}


            <footer className={"mt-10 mb-5"}>
                <Separator my="3" size="4"/>
                <Text as={"div"}>
                    Powered by{' '}
                    <Link href="https://github.com/vvbbnn00/USST-Lecture-Table-Calendar"
                          className="underline">USST-Lecture-Table-Calendar</Link>
                </Text>
                <Text>
                    Made with ❤️ by{' '}
                    <Link href="https://github.com/vvbbnn00" className="underline">vvbbnn00</Link>
                </Text>
            </footer>
        </main>
    );
}

