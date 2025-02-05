import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
    // التعبير المنظم لاكتشاف روابط فيسبوك
    const urlRegex = /https?:\/\/(?:www\.)?facebook\.com\/[^\s]+/i;
    const match = m.text.match(urlRegex);

    if (!match) {
        return; // لا يوجد رابط فيدو من فيسبوك في الرسالة
    }

    const videoUrl = match[0]; // استخراج رابط الفيديو
    await m.reply(wait);

    try {
        // استدعاء دالة التنزيل
        const { success, title, links } = await fb(videoUrl);

        if (!success || !links['Download High Quality']) {
            throw '❌ حدث خطأ أثناء محاولة التنزيل. يرجى المحاولة لاحقًا.';
        }

        const videoLink = links['Download High Quality'];
        const baseFilePath = `./src/tmp/${m.sender}`;
        const inputPath = await downloadMedia(videoLink, baseFilePath, 'mp4');
        const outputPath = inputPath.replace(/\.mp4$/, '.mp3'); // استبدال الامتداد بـ mp3

        // إرسال الفيديو بجودة عالية
        await conn.sendFile(m.chat, videoLink, '', `*${title || 'بدون عنوان'}*`, m);

        // تحويل الفيديو إلى MP3
        await convertToMp3(inputPath, outputPath);

        // قراءة ملف MP3
        const mp3Buffer = fs.readFileSync(outputPath);

        // إرسال ملف MP3
        await conn.sendMessage(
            m.chat,
            { audio: mp3Buffer, fileName: `output.mp3`, mimetype: 'audio/mpeg', ptt: false },
            { quoted: m }
        );

        // تنظيف الملفات المؤقتة
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
    } catch (e) {
        console.error(e);
        await m.reply('❌ حدث خطأ أثناء معالجة الطلب.');
    }
};

handler.tags = ['downloader'];
handler.customPrefix = /https?:\/\/(?:www\.)?facebook\.com\//i;
handler.command = new RegExp;

export default handler;

// دالة التنزيل من فيسبوك
async function fb(vid_url) {
    try {
        const data = {
            url: vid_url,
        };
        const searchParams = new URLSearchParams();
        searchParams.append('url', data.url);
        const response = await fetch('https://facebook-video-downloader.fly.dev/app/main.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: searchParams.toString(),
        });
        const responseData = await response.json();
        return responseData;
    } catch (e) {
        return {
            success: false,
            error: e.message,
        };
    }
}

// وظائف مساعدة
async function downloadMedia(url, basePath, extension) {
    const response = await fetch(url);
    const buffer = await response.buffer();
    const filePath = await getUniqueFileName(basePath, extension);
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

async function getUniqueFileName(basePath, extension) {
    let fileName = `${basePath}.${extension}`;
    let counter = 1;
    while (fs.existsSync(fileName)) {
        fileName = `${basePath}_${counter}.${extension}`;
        counter++;
    }
    return fileName;
}

function convertToMp3(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .toFormat('mp3')
            .on('end', resolve)
            .on('error', reject)
            .save(outputPath);
    });
}