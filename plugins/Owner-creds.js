import fs from 'fs';
import pino from 'pino';
import {makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore} from 'baileys';

const handler = async (m, {conn, text}) => {
    if (!text) {
        await conn.sendMessage(m.chat, { text:`ارسال الامر متبوع بالرقم، مثال :\n.creds 212....` });
    } else {
        await conn.sendMessage(m.chat, { text:`سيصلك رمز الاقتران بعد قليل ..` });
        let number = text;
        NourPair(number);
    }  

    //fun
    function removeFile(FilePath) {
        try {
            if (!fs.existsSync(FilePath)) return false;
            fs.rmSync(FilePath, { recursive: true, force: true });
        } catch (e) {
            console.log(e);
        }
    }

    async function NourPair(number) {
        try {
            const { state, saveCreds } = await useMultiFileAuthState(`./tmpsession`);
            try {
                let NourSock = makeWASocket({
                    auth: {
                        creds: state.creds,
                        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                    },
                    printQRInTerminal: false,
                    logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                    browser: ["Ubuntu", "Chrome", "20.0.04"],
                });

                if (!NourSock.authState.creds.registered) {
                    await delay(1500);
                    number = number.replace(/[^0-9]/g, '');
                    const code = await NourSock.requestPairingCode(number);  
                    await conn.sendMessage(m.chat, { text: code });
                }

                NourSock.ev.on('creds.update', saveCreds);
                NourSock.ev.on("connection.update", async (s) => {
                    const { connection, lastDisconnect } = s;
                    if (connection == "open") {
                        await delay(10000);
                        const NourSession = fs.readFileSync('./tmpsession/creds.json');

                        // تم حذف السطر الذي يرسل الملف إلى الرقم المحدد
                        const NourRes = await NourSock.sendMessage(NourSock.user.id, {
                            document: NourSession,
                            mimetype: `application/json`,
                            fileName: `creds.json`
                        });

                        await NourSock.sendMessage(NourSock.user.id, { text: `♻️هذا السيسيون الخاص بك\n\n© حاول ان لا تشاركه🙈 مع اشخاص 🩶لا تتق فيهم` }, { quoted: NourRes });

                        await conn.sendMessage(m.chat, { text:`تم تسجيل الدخول بنجاح\n وتم ارسال ملف السيسيون الى رقمك` });
                        await delay(100);
                        await NourSock.end();
                        await removeFile('./tmpsession');       
                        return;
                    } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                        await delay(1000);
                        NourPair(number);
                        return;
                    }
                });
                await delay(90 * 1000);
                await NourSock.end();
                await removeFile('./tmpsession');      
            } catch (err) {
                console.log("Service restarted due to error:");
                await conn.sendMessage(m.chat, { text:`حدث خطا، اعد المحاولة` });
                await NourSock.end();
                await removeFile('./tmpsession');
                console.log({ code: "Service Unavailable" });
            }
        } catch (e) {
            console.log(e);
        }
    }

}

handler.command = ['crs'];
handler.help = ['crs'];
handler.tags = ['owner'];
handler.owner = false ;
export default handler;
