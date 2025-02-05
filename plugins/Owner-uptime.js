const handler = async (m, { text, usedPrefix, command, conn }) => {
    // احصل على وقت التشغيل (uptime)
    const uptimeMilliseconds = process.uptime() * 1000; // الوقت الذي استغرقه السكربت يعمل (بالثواني)
    const uptimeDate = new Date(uptimeMilliseconds);

    // احصل على الوقت الحالي
    const now = new Date();
    const day = now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    // مدة التشغيل بالساعات والدقائق والثواني
    const hours = Math.floor(uptimeMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptimeMilliseconds % (1000 * 60)) / 1000);

    // بناء الرسالة
    const message = `⌛ مدة التشغيل: ${hours} ساعة، ${minutes} دقيقة، ${seconds} ثانية.
📅 التاريخ الحالي: ${day}.
🕒 الوقت الحالي: ${time}.`;

    // أرسل الرسالة
    await conn.sendMessage(m.chat, { text: message }, { quoted: m });
};

handler.command = /^(uptime)$/i;

export default handler;
