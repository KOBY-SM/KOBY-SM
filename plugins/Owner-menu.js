import { generateWAMessageFromContent } from 'baileys'
import os from 'os'
import PhoneNumber from 'awesome-phonenumber'

let handler = async (m, { conn, usedPrefix: _p }) => {

  try {
await conn.sendMessage(m.chat, { react: { text: '🩶', key: m.key } })
    let user = `@${m.sender.split('@')[0]}`

    let tags = {}
    const defaultMenu = {
      before: `
> *_乂 KOBY-MD - BOT_*
 
_© ${conn.user.name}_ 
  %readmore
      `.trimStart(),
      header: '╭┉┉🩵┉≻ *“%category”* ≺┉🩶┉┉',
      body: `┆ \t ♧ _%cmd%islimit%isPremium_ `,
      footer: '┆',
      after: `╰┉┉🌼┉≻\t _© ${conn.user.name}_ \t`,
    }

    let name = m.pushName || conn.getName(m.sender) || "مستخدم"
    let d = new Date(new Date() + 3600000)
    let locale = 'en'
    let date = d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Africa/Casablanca'
    })
    let time = d.toLocaleTimeString(locale, { timeZone: 'Asia/Kolkata' }).replace(/[.]/g, ':')

    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)

    let totalreg = global.db?.data?.users ? Object.keys(global.db.data.users).length : 0
    let platform = os.platform()

    let help = Object.values(global.plugins || {}).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit,
        premium: plugin.premium,
        enabled: !plugin.disabled,
      }
    })

    for (let plugin of help) {
      if (plugin && 'tags' in plugin) {
        for (let tag of plugin.tags) {
          if (!(tag in tags) && tag) tags[tag] = tag
        }
      }
    }

    conn.menu = conn.menu || {}

    let before = conn.menu.before || defaultMenu.before
    let header = conn.menu.header || defaultMenu.header
    let body = conn.menu.body || defaultMenu.body
    let footer = conn.menu.footer || defaultMenu.footer
    let after = conn.menu.after || defaultMenu.after

    let _text = [
      before,
      ...Object.keys(tags).map(tag => {
        return header.replace(/%category/g, tags[tag].toUpperCase()) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(help => {
              return body.replace(/%cmd/g, menu.prefix ? help : '%p' + help)
                .replace(/%islimit/g, menu.limit ? '(Limit)' : '')
                .replace(/%isPremium/g, menu.premium ? '(Premium)' : '')
                .trim()
            }).join('\n')
          }),
          footer
        ].join('\n')
      }),
      after
    ].join('\n')

    let text = typeof conn.menu == 'string' ? conn.menu : typeof conn.menu == 'object' ? _text : ''
    let replace = {
      '%': '%',
      p: _p, uptime,
      me: conn.getName(conn.user.jid) || "البوت",
      name, date, time, platform, _p, totalreg,
      readmore: readMore
    }
    text = text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name])

    const vi = [
      'https://qu.ax/HzRPk.jpg',
      'https://qu.ax/HzRPk.jpg',
      'https://qu.ax/HzRPk.jpg'
    ]

    let vid = vi[Math.floor(Math.random() * vi.length)]

    let hi = `\n\n\t\t _السلام عليكم يا ${name}_ \t\t\n\n`

    const totag = { contextInfo: { mentionedJid: [m.sender] }}

    let ppl = await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://qu.ax/HzRPk.jpg')
    let ppb = await conn.profilePictureUrl(conn.user.jid, 'image').catch(() => 'https://qu.ax/HzRPk.jpg')

    // إرسال رمز التفاعل ✅
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    // إرسال الصورة مع المعلومات
    await conn.sendMessage(m.chat, { 
      image: { url: 'https://qu.ax/HzRPk.jpg' }, 
      caption: text.trim(), 
      contextInfo: { 
        externalAdReply: { 
          title: conn.user.name, 
          body: '', 
          thumbnailUrl: ppb, 
          sourceUrl: "", 
          mediaType: 1, 
          renderLargerThumbnail: false 
        } 
      }
    })

  } catch (e) {
    console.error(e)
    m.reply('حدث خطأ: ' + e.message)
  }
}

handler.command = /^(mu|help|\?)$/i
handler.exp = 3

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}