import axios from 'axios';

const handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    if (!text) return m.reply(`الذكاء الإصطناعي (KOBY) \n\n مثال \n${usedPrefix + command} مرحبا يا  ${await conn.getName(m.sender)},`);
    await conn.sendMessage(m.chat, { text: 'إنتظر...' }, { quoted: m });
    let result = await luminAi(text, m.sender, `إسمك هو محمد، وصانعك هو EL KOBY، وخصمك هو  ${await conn.getName(m.sender)}, أجب بمتعة وأستخدم في إجابتك رموز تعبيرية `);
    await m.reply(result);
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
  }
};

handler.help = ['ai'];
handler.tags = ['ai'];
handler.command = /^ai$/i;
handler.limit = false;

export default handler;

async function luminAi(teks, pengguna = null, prompt = null, modePencarianWeb = false) {
  try {
    const data = { content: teks };
    if (pengguna !== null) data.user = pengguna;
    if (prompt !== null) data.prompt = prompt;
    data.webSearchMode = modePencarianWeb;
    const { data: res } = await axios.post("https://luminai.my.id/", data);
    return res.result;
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    throw error;
  }
}
