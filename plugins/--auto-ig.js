import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
  // التحقق من صحة الرابط المرسل
  const instagramUrlPattern = /^(https?:\/\/)?(www\.)?(instagram\.com|ig\.me)\/.+$/;
  const messageText = m.text.trim();

  if (!instagramUrlPattern.test(messageText)) {
    return conn.reply(m.chat, '🪐 يرجى إدخال رابط إنستجرام صحيح.', m);
  }

  m.reply('🪐 جاري تنزيل الوسائط...'); // إعلام المستخدم أنه يتم التنزيل

  try {
    // الحصول على البيانات من API
    let api = await axios.get(`https://apidl.asepharyana.cloud/api/downloader/igdl?url=${messageText}`);

    let processedUrls = new Set();

    for (let a of api.data.data) {
      if (!processedUrls.has(a.url)) {
        processedUrls.add(a.url);

        // التحقق مما إذا كانت الوسائط صورة أو فيديو
        if (a.url.includes('jpg') || a.url.includes('png') || a.url.includes('jpeg') || a.url.includes('webp') || a.url.includes('heic') || a.url.includes('tiff') || a.url.includes('bmp')) {
          await conn.sendMessage(
            m.chat,
            { 
              image: { url: a.url }, 
              caption: '*✔️ تم تنزيل الصورة بنجاح!*' 
            },
            { quoted: m }
          );
        } else {
          // تنزيل الفيديو
          const videoBuffer = await downloadMedia(a.url);
          const videoPath = `./src/tmp/${m.sender}.mp4`;
          fs.writeFileSync(videoPath, videoBuffer);
          const audioPath = videoPath.replace('.mp4', '.mp3');

          // تحويل الفيديو إلى MP3
          await convertToMp3(videoPath, audioPath);

          // إرسال الفيديو
          await conn.sendMessage(
            m.chat,
            { 
              video: { url: a.url }, 
              caption: '*✔️ تم تنزيل الفيديو بنجاح!*' 
            },
            { quoted: m }
          );

          // إرسال الصوت MP3
          const mp3Buffer = fs.readFileSync(audioPath);
          await conn.sendMessage(
            m.chat,
            { audio: mp3Buffer, fileName: `output.mp3`, mimetype: 'audio/mpeg', ptt: false },
            { quoted: m }
          );

          // تنظيف الملفات المؤقتة
          fs.unlinkSync(videoPath);
          fs.unlinkSync(audioPath);
        }
      }
    }

  } catch (error) {
    console.error('حدث خطأ أثناء التنزيل:', error);
    m.reply('⚠️ حدث خطأ أثناء تنزيل الوسائط. حاول مرة أخرى لاحقًا.');
  }
};

// دالة لتحميل الوسائط
async function downloadMedia(url) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  return buffer;
}

// دالة لتحويل الفيديو إلى MP3
function convertToMp3(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat('mp3')
      .on('end', resolve)
      .on('error', reject)
      .save(outputPath);
  });
}

// جعل البوت يعمل تلقائيًا عند إرسال رابط إنستجرام
handler.customPrefix = /^(https?:\/\/)?(www\.)?(instagram\.com|ig\.me)\/.+$/;
handler.command = new RegExp(); // بدون أمر محدد

export default handler;