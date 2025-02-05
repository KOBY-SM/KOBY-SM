const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = (await import('baileys')).default;
import yts from 'yt-search'
import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text }) => {
   if (!text) return m.reply(`${usedPrefix + command} stereo love`)
   
   try {
      m.reply(wait)
      let search = await yts(text)
      let video = search.all[0]
      let linkyt = video.url
      let teksnya = `ᴛɪᴛʟᴇ : *${video.title}*\nᴠɪᴇᴡs : *${video.views}*\nᴅᴜʀᴀᴛɪᴏɴ : *${video.timestamp}*\nᴜᴘʟᴏᴀᴅᴇᴅ : *${video.ago}*\nᴜʀʟ : *${linkyt}*`

      const { imageMessage } = await prepareWAMessageMedia(
            {
                image: { url: video.thumbnail }
            },
            { upload: conn.waUploadToServer }
        );

        const messageContent = {
            buttonsMessage: {
                contentText: teksnya,
                footerText: global.namabotbot,
                buttons: [
                    {
                        buttonId: `${linkyt}`,
                        buttonText: { displayText: 'Video 🎬' },
                        type: 1
                    },
                    {
                        buttonId: `.ytmp3 ${linkyt}`,
                        buttonText: { displayText: 'Audio 🎧' },
                        type: 1
                    }
                ],
                headerType: 4,
                imageMessage: imageMessage,
            }
        };

        const message = generateWAMessageFromContent(
            m.chat,
            {
                ephemeralMessage: {
                    message: messageContent
                }
            },
            { userJid: conn.user.id }
        );

        await conn.relayMessage(m.chat, message.message, { messageId: message.key.id });
    } catch (error) {
        console.error("Gagal mengirim pesan button dengan gambar:", error);
        await conn.sendMessage(m.chat, { text: "Maaf, terjadi kesalahan saat mengirim pesan." });
    }
}

handler.help = ['play'].map(v => v + ' <pencarian>');
handler.tags = ['downloader'];
handler.command = /^play$/i;
handler.limit = false 

export default handler