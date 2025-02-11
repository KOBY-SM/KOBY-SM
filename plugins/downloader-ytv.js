import fs from "fs";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

// تحديد مسار ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

const handler = async (m, { conn, usedPrefix, text, command }) => {
   if (!text) return m.reply(`.ytv link`);

   const url = text.trim();
   const format = '360';

   m.reply(wait);
   const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;

   if (!regex.test(url)) {
       return m.reply('❌ الرابط غير صالح، يرجى إدخال رابط يوتيوب صحيح.');
   }

   try {
       const response = await axios.post('http://kinchan.sytes.net/ytdl/downloader', {
           url: url,
           format: format
       });

       const { title, downloadUrl } = response.data;

       // تنزيل الفيديو
       const videoBuffer = await (await axios.get(downloadUrl, { responseType: 'arraybuffer' })).data;
       const videoPath = `./src/tmp/youtube_${Date.now()}.mp4`;
       const audioPath = videoPath.replace('.mp4', '.mp3');

       fs.writeFileSync(videoPath, videoBuffer);

       // إرسال الفيديو مباشرة إلى المستخدم
       await conn.sendMessage(m.chat, {
           video: fs.readFileSync(videoPath),
           caption: `🎬 *العنوان:* ${title}`,
           mimetype: 'video/mp4'
       }, { quoted: m });

       // استخراج الصوت في نفس الوقت أثناء إرسال الفيديو
       // استخراج الصوت كملف MP3 باستخدام ffmpeg بشكل أسرع
       ffmpeg(videoPath)
           .output(audioPath)
           .toFormat('mp3')
           .audioBitrate(128)  // تقليل bitrate لتحسين الأداء
           .audioChannels(1)   // تحويل الصوت إلى قناة واحدة لتحسين الأداء
           .on('end', async () => {
               // إرسال الصوت المستخرج كـ PTT بمجرد الانتهاء من الاستخراج
               await conn.sendMessage(
                   m.chat,
                   { audio: fs.readFileSync(audioPath), mimetype: 'audio/mpeg', ptt: false },
                   { quoted: m }
               );
               // حذف الملفات المؤقتة بعد الإرسال
               fs.unlinkSync(videoPath);
               fs.unlinkSync(audioPath);
           })
           .on('error', (err) => {
               console.error('Error during audio extraction:', err);
               m.reply('❌ حدث خطأ أثناء استخراج الصوت.');
           })
           .run(); // تشغيل عملية ffmpeg
   } catch (error) {
       console.error('Error:', error);
       m.reply('❌ حدث خطأ أثناء تحميل الفيديو. حاول مرة أخرى.');
   }
};

handler.help = ['ytv'];
handler.tags = ['downloader'];
handler.command = /^(ytv)$/i;
export default handler;