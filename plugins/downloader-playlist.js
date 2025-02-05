import yts from 'yt-search';
import axios from 'axios';

const handler = async (m, { conn, command, text, usedPrefix }) => {
    if (!text) throw `Use example: ${usedPrefix}${command} <search term>`;

    // Pencarian video berdasarkan query
    const search = await yts(text);
    const vid = search.videos[0];
    if (!vid) throw 'Video tidak ditemukan, coba judul lain';

    const { title, thumbnail, timestamp, views, ago, url, description, author } = vid;

    try {
        // Mengunduh URL audio dari API ryzendesu
        const response = await axios.get(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${encodeURIComponent(url)}`);
        const downloadUrl = response.data.url;
        if (!downloadUrl) throw new Error('Audio URL not found');

        // Membuat teks detail untuk pesan
        const caption = `
∘ 🎟️ *Title*: ${title}
∘ 📍 *Ext*: Search
∘ 🎬 *Duration*: ${timestamp}
∘ 👁️ *Viewers*: ${views}
∘ 🆙 *Uploaded*: ${ago}
∘ ✍️ *Author*: ${author.name}
∘ 🔗 *URL*: ${url}

∘ 📝 *Description*: ${description.slice(0, 200)}...
`;

        // Mengirim gambar dengan caption tanpa انتظار الصورة
        await conn.sendMessage(m.chat, { 
            image: { url: thumbnail }, 
            caption 
        }, { quoted: m });

        // إرسال الصوت كمرفق PTT بدون استخدام التدفق
        const audioBuffer = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(audioBuffer.data);

        // إرسال الصوت مباشرة على شكل PTT
        await conn.sendMessage(m.chat, {
            audio: buffer,
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            ptt: true,
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    mediaType: 2,
                    mediaUrl: url,
                    title: title,
                    body: 'Audio Download',
                    sourceUrl: url,
                    thumbnail: await (await conn.getFile(thumbnail)).data,
                },
            },
        }, { quoted: m });

    } catch (error) {
        console.error('Error:', error.message);
        throw `Error: ${error.message}. Coba ulangi lagi..`;
    }
};

handler.help = ['ply2 <query>'];
handler.tags = ['downloader'];
handler.command = /^ply2$/i;
handler.register = false;
handler.disable = false;

export default handler;