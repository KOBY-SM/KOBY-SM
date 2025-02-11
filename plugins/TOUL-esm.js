import axios from 'axios';

const handler = async (m, { text }) => {
    const PROGE = `SAYA INGIN ANDA MENGKONVERSI CASE INI KE PLUGIN!!\nSETIAP CASE ADALAH 1 PLUGIN\n\nCONTOH PLUGIN\n\`\`\`javascript\n\nconst handler = async (m, { conn, text, command }) => {\n    try {\n        m.reply('Tes berhasil');\n        conn.sendMessage(m.chat, {});\n        conn.sendFile();\n        conn.relayMessage();\n        conn.query();\n    } catch (error) {\n        console.error('Plugin error:', error);\n        m.reply(\`❌ *ERROR:* \${error.message}\`);\n    }\n};\n\nhandler.command = /^(vaxiona?)$/i;\nhandler.premium = false;\nhandler.limit = false;\nhandler.owner = false;\nhandler.tags = [\"command\"];\n\nexport default handler;\n\`\`\`\n\njawab dalam format javascript saja dan tidak perlu kasih penjelasan cukup kode dengan format\n\`\`\`javascript\n\`\`\`\nJIKA ADA BANYAK CASE MAKA\n\`\`\`javascript\n\`\`\`\n\`\`\`javascript\n\`\`\`\n...\n\nBERIKUT CODE CASENYA:\n`;
    
    const { data: potongan } = await axios.get(`https://api.siputzx.my.id/api/ai/gpt3?prompt=kamu adalah chatgpt&content=${PROGE}${text}`);
    const plugine = potongan.data.split('```javascript');
    
    for (let pluge of plugine) {
        await m.reply(pluge.replace(/```[\s\n]*$/, ""));
    }
};

handler.command = /^esm$/i;

export default handler;