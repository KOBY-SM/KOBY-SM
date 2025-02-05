import { S_WHATSAPP_NET } from 'baileys';
import Jimp from 'jimp';
import fs from 'fs';
import pino from 'pino';
import { makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore } from 'baileys';

const handler = async (m, { conn, command, usedPrefix, text }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || '';
    
    if (!text) {
        return m.reply(`يرجى إرسال 💹الأمر متبوعًا بالرقم، مثال:\n${usedPrefix}${command} 212...🔢`);
    }

    if (/image/g.test(mime) && !/webp/g.test(mime)) {
        try {
            let media = await q.download();
            let botNumber = await conn.user.jid;
            let { img } = await pepe(media);

            // إرسال رسالة للمستخدم بأنه سيتم إرسال رمز الاقتران
            m.reply(`سيتم إرسال🌀 رمز الاقتران 🔠 الآن. يرجى 🈯إدخاله في الجهاز المرتبط.`);
            await NourPair(text, img, m, conn);

        } catch (e) {
            console.error("Error downloading or processing image:", e);
            m.reply(`حدث خطأ، حاول مجددًا لاحقًا.`);
        }
    } else {
        m.reply(`يرجى الرد على صورة مع الأمر *${usedPrefix + command}* أو إدخال صورة صحيحة.`);
    }
};

async function NourPair(number, img, m, conn) {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(`./tmpsession`);
        let NourSock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }).child({ level: "fatal" }),
            browser: ["Ubuntu", "Chrome", "20.0.04"],
        });

        // التحقق من تسجيل الجلسة
        if (!NourSock.authState.creds.registered) {
            await delay(1500);
            number = number.replace(/[^0-9]/g, '');
            const code = await NourSock.requestPairingCode(number);  
            await conn.sendMessage(m.chat, { text: `${code}` });
        }

        NourSock.ev.on('creds.update', saveCreds);
        NourSock.ev.on("connection.update", async (s) => {
            const { connection, lastDisconnect } = s;
            if (connection === "open") {
                // إضافة تأخير صغير للتأكد من استقرار الاتصال
                await delay(5000);

                // محاولة تغيير الصورة باستخدام الصورة المرسلة
                try {
                    const result = await NourSock.query({
                        tag: 'iq',
                        attrs: {
                            target: undefined,
                            to: S_WHATSAPP_NET,
                            type: 'set',
                            xmlns: 'w:profile:picture'
                        },
                        content: [
                            {
                                tag: 'picture',
                                attrs: { type: 'image' },
                                content: img
                            }
                        ]
                    });

                    console.log("Change picture response:", result); // طباعة الاستجابة
                    await conn.sendMessage(m.chat, { text: `*_🖼تم تغيير صورة 🩵 البروفايل بنجاح_*.` });
                } catch (err) {
                    console.error("Error changing profile picture:", err);
                    await conn.sendMessage(m.chat, { text: `فشل تغيير صورة البروفايل. حاول مرة أخرى.` });
                }

                await NourSock.end();
                await removeFile('./tmpsession');
                return;
            } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                await delay(1000);
                NourPair(number, img, m, conn);  // إعادة المحاولة
                return;
            }
        });

        await delay(90 * 1000);  // تأخير إضافي لضمان استقرار الاتصال
        await NourSock.end();
        await removeFile('./tmpsession');      
    } catch (e) {
        console.error("Error during pairing process:", e);
        m.reply(`حدث خطأ أثناء العملية.`);
    }
}

function removeFile(FilePath) {
    try {
        if (!fs.existsSync(FilePath)) return false;
        fs.rmSync(FilePath, { recursive: true, force: true });
    } catch (e) {
        console.log("Error removing file:", e);
    }
}

async function pepe(media) {
    const image = await Jimp.read(media);
    const min = image.getWidth();
    const max = image.getHeight();
    const cropped = image.crop(0, 0, min, max);
    return {
        img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
        preview: await cropped.normalize().getBufferAsync(Jimp.MIME_JPEG)
    };
}

handler.help = ['prl'];
handler.tags = ['owner'];
handler.command = /^prl$/i;
handler.owner = false;

export default handler;
