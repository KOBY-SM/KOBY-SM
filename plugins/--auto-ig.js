import axios from 'axios';

let handler = async (m, { text, args, conn }) => {  
  const instagramUrlPattern = /^(https?:\/\/)?(www\.)?(instagram\.com|ig\.me)\/.+$/;
  const messageText = m.text.trim();

  if (!instagramUrlPattern.test(messageText)) {
    return; // إنهاء العملية إذا لم يكن الرابط من إنستجرام
  }

  m.reply(wait);

  try {
    let mediaInfo = await instagramdl(messageText);

    if (mediaInfo.videoUrl) {
      let vid = await axios.get(mediaInfo.videoUrl, { responseType: 'arraybuffer' });
      await conn.sendMessage(m.chat, { video: Buffer.from(vid.data), caption: '✅ تم تنزيل الفيديو بنجاح!' }, { quoted: m });
    } else if (mediaInfo.imageUrl) {
      let img = await axios.get(mediaInfo.imageUrl, { responseType: 'arraybuffer' });
      await conn.sendMessage(m.chat, { image: Buffer.from(img.data), caption: '✅ تم تنزيل الصورة بنجاح!' }, { quoted: m });
    } else {
      return m.reply('🚫 لم يتم العثور على أي وسائط.');
    }
  } catch (error) {
    console.error("Error downloading Instagram media:", error);
    m.reply('⚠️ حدث خطأ أثناء تنزيل الوسائط. حاول مرة أخرى لاحقًا.');
  }
};

// جعل البوت يعمل تلقائيًا عند إرسال رابط إنستجرام
handler.customPrefix = /^(https?:\/\/)?(www\.)?(instagram\.com|ig\.me)\/.+$/;
handler.command = new RegExp(); // بدون أمر محدد

export default handler;

let instagramdl = async (url) => {
  let mediaInfo = await getMediaInfoFromAPI(url, 'https://api.vreden.web.id/api/igdownload?url=');

  if (!mediaInfo.videoUrl && !mediaInfo.imageUrl) {
    mediaInfo = await getMediaInfoFromAPI(url, 'https://api.siputzx.my.id/api/d/igdl?url=');
  }

  return mediaInfo;
};

let getMediaInfoFromAPI = async (url, apiUrl) => {
  try {
    let res = await axios.get(`${apiUrl}${encodeURIComponent(url)}`);
    let data = res.data.data ? res.data.data[0] : null;
    return {
      videoUrl: data?.url || null,
      imageUrl: data?.thumbnail || null,
    };
  } catch {
    return {};
  }
};
