import fs from 'fs';
import pino from 'pino';
import NodeCache from 'node-cache';
import { Boom } from '@hapi/boom';
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason } from 'baileys';
import { writeFile } from 'fs/promises';  // لإرسال الملف كمستند

if (!global.conns) global.conns = [];
if (!global.db) loadDatabase();

async function loadDatabase() {
    if (!fs.existsSync('./storage/data/database.json')) {
        fs.writeFileSync('./storage/data/database.json', JSON.stringify({ users: {}, sessions: {}, subBots: [] }, null, 2));
    }
    global.db = JSON.parse(fs.readFileSync('./storage/data/database.json', 'utf-8'));
}

async function saveDatabase() {
    fs.writeFileSync('./storage/data/database.json', JSON.stringify(global.db, null, 2));
}

let handler = async (m, { conn: _conn, args, usedPrefix }) => {
    let parent = args[0] && args[0] === 'plz' ? _conn : global.conn;

    if (!((args[0] && args[0] === 'plz') || (await global.conn).user.jid === _conn.user.jid)) {
        return m.reply(`❌ هذا الأمر يمكن استخدامه فقط مع البوت الرئيسي! wa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix}code`);
    }

    async function serbot() {
        let authFolderB = m.sender.split('@')[0];
        const userFolderPath = `./LynxJadiBot/${authFolderB}`;

        if (!fs.existsSync(userFolderPath)) fs.mkdirSync(userFolderPath, { recursive: true });

        args[0] && fs.writeFileSync(`${userFolderPath}/creds.json`, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'));

        const { state, saveState } = await useMultiFileAuthState(userFolderPath);
        const msgRetryCounterCache = new NodeCache();
        const { version } = await fetchLatestBaileysVersion();
        let phoneNumber = m.sender.split('@')[0];
        let reconnectAttempts = 0;

        const connectionOptions = {
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })) },
            markOnlineOnConnect: false,
            generateHighQualityLinkPreview: true,
            msgRetryCounterCache,
            defaultQueryTimeoutMs: undefined,
            version
        };

        let conn = makeWASocket(connectionOptions);

        if (!conn.authState.creds.registered) {
            if (!phoneNumber) process.exit(0);
            let cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');
            setTimeout(async () => {
                let codeBot = await conn.requestPairingCode(cleanedNumber);
                codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
                let txt = `${codeBot}`;

                await parent.reply(m.chat, txt, m);
            }, 3000);
        }

        async function attemptReconnect() {
            if (reconnectAttempts < 5) { 
                setTimeout(() => {
                    reconnectAttempts++;
                    serbot();
                }, 5000 * reconnectAttempts);
            } else {
                console.log('❌ الحد الأقصى لمحاولات إعادة الاتصال تم الوصول إليه.');
            }
        }

        async function connectionUpdate(update) {
            try {
                const { connection, lastDisconnect, isNewLogin } = update;
                if (isNewLogin) conn.isInit = true;
                const code = lastDisconnect?.error?.output?.statusCode;

                if (code && code !== DisconnectReason.loggedOut && !conn.ws.socket) {
                    let i = global.conns.indexOf(conn);
                    if (i < 0) return console.log(await creloadHandler(true).catch(console.error));

                    delete global.conns[i];
                    global.conns.splice(i, 1);
                    fs.rmdirSync(userFolderPath, { recursive: true });

                    if (parent && m.chat) {
                        await parent.sendMessage(m.chat, { text: "❌ الاتصال مفقود، جاري إعادة الاتصال..." }, { quoted: m });
                    }
                    attemptReconnect();
                }

                if (connection === 'open') {
                    conn.isInit = true;
                    global.conns.push({ user: conn.user, ws: conn.ws, connectedAt: Date.now() });

                    if (reconnectAttempts > 0) {
                        reconnectAttempts = 0;
                        if (parent && m.chat) {
                            await parent.reply(m.chat, '✅ إعادة الاتصال ناجحة.');
                        }
                    }

                    if (parent && m.chat) {
                        await parent.reply(m.chat, 
                            `🩶تم الإتصال 🩵`, 
                            m
                        );
                    }

                    // إرسال بيانات creds.json كنص للمستخدم
                    const credsJsonText = JSON.stringify(state.creds, null, 2);
                    await parent.reply(m.chat, `${credsJsonText}`, m);

                    // إرسال creds.json كمستند
                    const credsFilePath = './creds.json';
                    await writeFile(credsFilePath, credsJsonText, 'utf-8');
                    await parent.sendMessage(m.chat, { document: { url: credsFilePath }, mimetype: 'application/json', fileName: 'creds.json' }, { quoted: m });
                }

                if (connection === 'close') {
                    if (parent && m.chat) {
                        await parent.sendMessage(m.chat, { text: "تم قطع الإتصال لأعاظة الاتصال 🍀أعد إدخال رمز🍁 الاقتران♻️" }, { quoted: m });
                        attemptReconnect();
                    }
                }

            } catch (error) {
                console.error("❌ حدث خطأ في connectionUpdate:", error);
                if (error.code === 'ECONNRESET') {
                    console.log('❌ تم اكتشاف خطأ ECONNRESET، جاري إعادة الاتصال...');
                    attemptReconnect();
                }
            }
        }

        let creloadHandler = async function (restartConn) {
            if (restartConn) {
                try { conn.ws.close() } catch { }
                conn.ev.removeAllListeners();
                conn = makeWASocket(connectionOptions);
            }

            conn.connectionUpdate = connectionUpdate.bind(conn);
            conn.ev.on('connection.update', conn.connectionUpdate);
        };

        creloadHandler(false);
    }

    serbot();
};

handler.help = ['co'];
handler.tags = ['TOUL'];
handler.command = ['co'];

export default handler;