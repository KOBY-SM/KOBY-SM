import axios from "axios";

const handler = async (m, { conn, usedPrefix, text, command }) => {
   if (!text) return m.reply(`.ytv link`);

 const url = text.trim();
 const format = '360';

 m.reply(wait);
 const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;

 if (!regex.test(url)) {
 return m.reply('link yang anda berikan tidak valid, silahkan masuk kan link yang benar.');
 }
 try {
 const response = await axios.post('http://kinchan.sytes.net/ytdl/downloader', {
 url: url,
 format: format
 });

 const { title, downloadUrl } = response.data;

 const videos = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
 const video = Buffer.from(videos.data, 'binary');
 
 const caption = `*乂 YOUTUBE - VIDEO*\n` +
                        `*العنوان:* ${title}\n`;

 await conn.sendMessage(m.chat, {
 video: video,
 caption: caption,
 mimetype: 'video/mp4'
 }, { quoted: m });
 } catch (error) {
 console.error('Error:', error);
 m.reply('Terjadi kesalahan saat mengunduh video, silahkan coba lagi.');
 }
}

handler.help = ['ytv'];
handler.tags = ['downloader'];
handler.command = /^(ytv)$/i;
export default handler;