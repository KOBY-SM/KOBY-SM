import axios from 'axios'

let handler = async (m, {
    conn,
    args,
    text,
    usedPrefix,
    command
}) => {

    let info = `الرابط 📎! `
    if (!text) return m.reply(info)
    try {
        await m.reply(wait)
        let urlnya = text
        const {
            data
        } = await axios.post("https://aiovd.com/wp-json/aio-dl/video-data/", {
            url: urlnya
        });
        await conn.sendFile(m.chat, data.medias[1].url, '', 'Aio Downloader', m)

    } catch (e) {
        throw eror
    }
}

handler.help = ['all']
handler.tags = ['downloader']
handler.command = /^(all)$/i
handler.limit = false 
handler.register = false 

export default handler
