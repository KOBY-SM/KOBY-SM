import axios from 'axios';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import os from 'os';
import path from 'path';

let handler = async (m, { conn }) => {
    // تحقق من أن الرسالة تحتوي على رابط YouTube فقط
    const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    const messageText = m.text.trim();

    if (!youtubeUrlPattern.test(messageText) || messageText.split(/\s+/).length > 1) {
        return; // إنهاء العملية إذا كانت الرسالة تحتوي على كلمات أخرى أو ليست رابطًا صالحًا
    }

    m.reply(wait);
    try {
        // استدعاء API للحصول على تفاصيل الفيديو
        const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(messageText)}`;
        const response = await axios.get(apiUrl);

        if (!response.data?.result?.download_url) {
            await conn.sendMessage(
                m.chat,
                { text: "🚫 خطأ أثناء جلب الفيديو. تأكد من الرابط وحاول مرة أخرى." },
                { quoted: m }
            );
            return;
        }

        // استخراج التفاصيل من الرد
        const { title, download_url } = response.data.result;

        // تنزيل الفيديو إلى ملف مؤقت
        const tmpDir = os.tmpdir();
        const videoPath = path.join(tmpDir, `${title}.mp4`);
        const audioPath = videoPath.replace('.mp4', '.mp3');

        const videoStream = await axios({
            url: download_url,
            method: 'GET',
            responseType: 'stream',
        });

        const videoWriter = fs.createWriteStream(videoPath);
        videoStream.data.pipe(videoWriter);

        await new Promise((resolve, reject) => {
            videoWriter.on('finish', resolve);
            videoWriter.on('error', reject);
        });

        // إرسال الفيديو
        await conn.sendMessage(
            m.chat,
            {
                video: fs.readFileSync(videoPath),
                caption: `🎥 *Title:* ${title}\n📥 *Video downloaded successfully!*`,
            },
            { quoted: m }
        );

        // تحويل الفيديو إلى MP3
        await convertToMp3(videoPath, audioPath);

        // إرسال ملف الصوت
        await conn.sendMessage(
            m.chat,
            {
                audio: fs.readFileSync(audioPath),
                fileName: `${title}.mp3`,
                mimetype: 'audio/mpeg',
            },
            { quoted: m }
        );

        // تنظيف الملفات المؤقتة
        fs.unlinkSync(videoPath);
        fs.unlinkSync(audioPath);

        // تحديث الرسالة
        await conn.sendMessage(
            m.chat,
            { text: "✅ تم إرسال الفيديو والصوت بنجاح!" },
            { quoted: m }
        );
    } catch (error) {
        console.error("Error during YouTube processing:", error);

        await conn.sendMessage(
            m.chat,
            { text: "⚠️ حدث خطأ أثناء معالجة الفيديو. حاول مرة أخرى لاحقًا." },
            { quoted: m }
        );
    }
};

// إعدادات المعالج لجعل الكود يعمل تلقائيًا
handler.customPrefix = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/; // قبول الرسائل التي تحتوي على روابط YouTube
handler.command = new RegExp(); // بدون أمر محدد

export default handler;

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