import fetch from 'node-fetch'; // تأكد من تثبيت node-fetch

const handler = async (m, { conn, text }) => {
  if (!text) {
    throw `\`\`\`[ 🌴 ] من فضلك أدخل رابط يوتيوب. مثال:\n .yt https://www.youtube.com/watch?v=example\`\`\``;
  }

  try {
    // تنزيل المقطع الصوتي باستخدام الرابط المباشر
    const response = await fetch(`https://api.siputzx.my.id/api/dl/youtube/mp3?url=${text}`);
    const result = await response.json();

    if (!result || !result.data) {
      throw "لم يتم الحصول على رابط التنزيل.";
    }

    const audioUrl = result.data;

    // إرسال المقطع الصوتي مباشرة
    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      ptt: false, // لتحويل الصوت إلى ملاحظة صوتية (PTT)
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    throw "حدث خطأ أثناء معالجة طلبك.";
  }
};

handler.command = handler.help = ['ytmp3'];
handler.tags = ['downloader'];

export default handler;