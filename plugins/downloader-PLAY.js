import fetch from 'node-fetch'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'

let handler = async (m, { conn, command, text, usedPrefix }) => {
  if (!text) return conn.reply(m.chat, '❀ Ingresa un link de un video de youtube', m)
  //si borras creditos eri gei 👀
m.reply(wait)
  try {
    let api = await fetch(`https://api.davidcyriltech.my.id/download/ytmp3?url=${text}`)
    let json = await api.json()
    let { title, download_url } = json.result

    // Descargar الملف الصوتي
    const response = await fetch(download_url)
    const buffer = await response.buffer()

    // حفظ الصوت في ملف مؤقت
    const tempFile = `temp_${Date.now()}.mp3`
    fs.writeFileSync(tempFile, buffer)

    // تحويل الصوت إلى 48kbps باستخدام ffmpeg
    const outputFile = `output_${Date.now()}.mp3`
    
    await new Promise((resolve, reject) => {
      ffmpeg(tempFile)
        .audioBitrate(64) // تقليل معدل البت إلى 48kbps
        .audioChannels(1) // تحويل الصوت إلى قناة واحدة (Mono)
        .audioFrequency(22050) // تقليل معدل العينات إلى 22.05kHz
        .save(outputFile) // حفظ الملف المحول
        .on('end', resolve)
        .on('error', reject)
    })

    // إرسال الملف الصوتي المحول
    const audioBuffer = fs.readFileSync(outputFile)
    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      caption: `🎶 *${title}*`,
    }, { quoted: m })

    // تنظيف الملفات المؤقتة
    fs.unlinkSync(tempFile)
    fs.unlinkSync(outputFile)

  } catch (error) {
    console.error(error)
    m.reply('❌ حدث خطأ أثناء تحميل الأغنية. حاول مرة أخرى.')
  }
}

handler.command = ['ytmp3']

export default handler