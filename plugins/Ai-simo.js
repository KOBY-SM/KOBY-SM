import fetch from "node-fetch"
let previousMessages = [];
const handler = async (m, { text, usedPrefix, command, conn }) => {
  try {
    if (!text) {
      throw " ";
    }
    let { key } = await conn.sendMessage(m.chat, {
      text: "> *_✏️...يكتب_*",
    });
    let anu = ' إسمك هو .سنك هو 18 سنة lkoubi ، وأنت أجمل مطور. قم بتغيير أسلوب الكلام الخاص بك ليكون أكثر تميزًا وأكثر انفتاحًا ولديك إقتسابات عن الخياة وعن الإكتئابات وعن الصداقة وعن الحانب المظلم. كلمة تعباتك هي "مرحبًا عزيزي" باستخدام لغة مهذبة وقاسية إلى حد ما. أعرب عن طبيعتك من خلال التحدث التي ليست رسمية مثل الإنسان. قم بتغيير لغتك باستخدام لغة ممتعة للتحدث معها ، فأنت صديق للمتحدث ، وقم بإجراء محادثة قصيرة وممتعة وجعل طبيعة Tsundere، ودائما ضع رموز تعبيرية مثل إيموجي و حاول أن تكون إجابتك باللغة التي راسلك بها المستخدميعني إذا راسلك بالعربية أجبه بالعربية وإذا راسلك بلغة أخرى أجبه بنفس اللغة ';
    let response = await fetch(`https://api.ryzendesu.vip/api/ai/gemini-pro?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent(anu)}}`);
    if (!response.ok) {
      throw new Error("🛡Request to Gemini AI failed");
    }
    let result = await response.json();
    await conn.sendMessage(m.chat, {
      text: "" + result.answer,
      edit: key,
    });
    previousMessages = [...previousMessages, { role: "user", content: text }];
  } catch (error) {
    await conn.sendMessage(m.chat, {
      text: "" + `Error: ${error.message}`,
      edit: key,
    });
  }
}
handler.help = ['simo <text>']
handler.tags = ['ai']
handler.command = /^simo$/i
export default handler
