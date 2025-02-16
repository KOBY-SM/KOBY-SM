import fs from 'fs';
import { promisify } from 'util';
import fetch from 'node-fetch';

const writeFile = promisify(fs.writeFile);

async function downloadYtAudio(urls, conn, chatId) {
    const urlList = urls.split('\n').filter(url => url.startsWith('http'));
    
    for (const url of urlList) {
        try {
            // تحميل الصوت مباشرة بدون جلب معلومات الفيديو
            const audioRes = await fetch(`https://ytcdn.project-rian.my.id/audio?url=${encodeURIComponent(url)}&bitrate=128`);
            const audioBuffer = await audioRes.arrayBuffer();

            const filePath = `audio_${Math.floor(Math.random() * 99999)}.mp3`; // اسم عشوائي للملف
            await writeFile(filePath, Buffer.from(audioBuffer)); // حفظ الملف مؤقتًا

            // إرسال الملف كرسالة صوتية (بدون عنوان أو معلومات)
            await conn.sendMessage(chatId, {
                audio: fs.readFileSync(filePath),
                mimetype: 'audio/mpeg',
                ptt: false // يتم إرساله كمقطع صوتي وليس ملاحظة صوتية
            });

            fs.unlinkSync(filePath); // حذف الملف بعد الإرسال
        } catch (error) {
            console.error(`❌ خطأ أثناء معالجة ${url}:`, error);
        }
    }
}

// المعالج للروبوت
let handler = async (m, { conn, text }) => {
    if (!text) return m.reply(`❗️ يرجى إدخال URL`);
    if (!/http.+youtu/.test(text)) return m.reply('⚠️ أدخل URL يوتيوب صالح');
m.reply(wait);

    await downloadYtAudio(text, conn, m.chat);
};

handler.command = /^(ytmp3)$/i;

export default handler;