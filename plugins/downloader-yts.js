import yts from 'yt-search';
const {
  generateWAMessageContent,
  generateWAMessageFromContent,
  proto
} = (await import("baileys"))["default"];

let handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `🩵 *Escriba el título de algún vídeo de Youtube*\n\nEjemplo: ${usedPrefix}youtube Yotsuba`,
      m
    );
  }

  // البحث عن الفيديوهات باستخدام yt-search
  let results = await yts(text);
  let videos = results.videos.slice(0, 5); // الحصول على أول 5 فيديوهات

  let cards = [];
  for (let video of videos) {
    let thumbnail = video.thumbnail;
    let title = video.title;
    let url = video.url;

    // إنشاء رسالة الصورة
    let imageMessageContent = await generateWAMessageContent(
      {
        image: { url: thumbnail }
      },
      { upload: conn.waUploadToServer }
    );

    // إضافة الفيديو إلى الكروت
    cards.push({
      body: proto.Message.InteractiveMessage.Body.fromObject({
        text: `${title}\n\n🔗 رابط الفيديو: ${url}`
      }),
      footer: proto.Message.InteractiveMessage.Footer.fromObject({
        text: `👁 ${video.views} • ⏰ ${video.timestamp}`
      }),
      header: proto.Message.InteractiveMessage.Header.fromObject({
        title: '',
        hasMediaAttachment: true,
        imageMessage: imageMessageContent.imageMessage
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: [{
          name: "cta_audio",
          buttonParamsJson: JSON.stringify({
            display_text: "تحميل الصوت 🎵",
            url: `${url}`
          })
        }]
      })
    });
  }

  // إنشاء الرسالة النهائية
  const message = generateWAMessageFromContent(
    m.chat,
    {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `🔍 *Resultados para:* ${text}`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: "🔎 `Y O U T U B E - S E A R C H`"
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              hasMediaAttachment: false
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards: [...cards]
            })
          })
        }
      }
    },
    { quoted: m }
  );

  // إرسال الرسالة
  await conn.relayMessage(m.chat, message.message, { messageId: message.key.id });
};

handler.help = ['yts'];
handler.tags = ['downloader'];
handler.command = /^yts$/i;

export default handler;
