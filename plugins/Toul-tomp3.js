import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';  // استيراد ffmpeg-static
import path from 'path';

// تحديد المسار لـ ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

const handler = async (m, { conn }) => {
  const q = m.quoted || m;
  const mime = (q.msg || q).mimetype || '';
  if (/audio|video/.test(mime)) {
    const media = await q.download();
    const ext = mime.split('/')[1];
    const baseFilePath = `./src/tmp/${m.sender}`;
    const inputPath = await getUniqueFileName(baseFilePath, ext);
    const outputPath = inputPath.replace(/\.[^.]+$/, '.mp3'); // Replace extension with .mp3

    fs.writeFileSync(inputPath, media);

    // Convert video/audio to MP3
    await convertToMp3(inputPath, outputPath);

    // Send the MP3 file
    const mp3Buffer = fs.readFileSync(outputPath);
    await conn.sendMessage(
      m.chat,
      { audio: mp3Buffer, fileName: `output.mp3`, mimetype: 'audio/mpeg' },
      { quoted: m }
    );

    // Cleanup temporary files
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
  } else {
    throw '> *_🌼تحويل فيديو أو أوديو إلى مقطع صوتي🌼_*';
  }
};
handler.help = ['tomp3']
handler.tags = ['Toul']
handler.command = /^tomp3$/i;
export default handler;

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