import yts from 'yt-search';
import { prepareWAMessageMedia, generateWAMessageFromContent } from 'baileys';

const handler = async (m, { command, usedPrefix, conn, text }) => {
    if (!text) {
        await conn.sendMessage(m.chat, { text: `البحث في يوتيب ` }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '🚀', key: m.key } });
        return;
    }

    await conn.sendMessage(m.chat, { react: { text: '⏰️', key: m.key } });

    try {
        const yt_play = await yts(text);
        const video = yt_play.videos[0];

        if (!video) {
            throw new Error("لم يتم العثور على نتائج.");
        }

        const dataMessage = `*❲ نتيجة البحث عن : ${text} ❳*\n\n➤ العنوان : ${video.title}\n➤ النشر : ${video.ago}\n➤ الطول : ${formatDuration(video.duration.seconds)}\n➤ الرابط : ${video.url}\n➤ المشاهدات : ${formatNumber(video.views)}\n➤ القناة : ${video.author.name}`.trim();

        const messa = await prepareWAMessageMedia({ image: { url: video.thumbnail } }, { upload: conn.waUploadToServer });

        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: dataMessage },
                        footer: { text: `© ${global.wm}`.trim() },
                        header: {
                            hasMediaAttachment: true,
                            imageMessage: messa.imageMessage,
                        },
                        nativeFlowMessage: {
                            buttons: [
                                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '〘 🎧 صــوتي 〙', id: `${usedPrefix}ytmp3 ${video.url}` }) },
                                { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '〘 🎥 فيــديو 〙', id: `${video.url}` }) }
                            ],
                            messageParamsJson: "",
                        },
                    },
                },
            },
        }, { userJid: conn.user.jid, quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (error) {
        await conn.sendMessage(m.chat, { text: `*❲ ❗ ❳ حدث خطأ أثناء البحث .*\nيرجى تجربة إدخال نص مختلف أو رابط مباشر.` }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
};

handler.command = /^(play)$/i;
export default handler;

function formatNumber(number) {
    return number.toLocaleString('ar-EG');
}

function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h ? h + ' ساعة ' : ''}${m ? m + ' دقيقة ' : ''}${s ? s + ' ثانية' : ''}`.trim();
}