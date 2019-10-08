const Telegraf = require('telegraf')
const { Extra, Markup, Composer } = Telegraf
const path = require('path')

const session = require('telegraf/session')
require('dotenv').config()
const token = process.env.TELEGRAM_BOT_KEY
const bot = new Telegraf(token)

const TelegrafI18n = require('telegraf-i18n')
const i18n = new TelegrafI18n({
  defaultLanguage: 'en',
  allowMissing: false, // Default true
  directory: path.resolve(__dirname, 'locales')
})
bot.use(i18n.middleware())

// Set locale to `en`
bot.command('en', ({ i18n, replyWithHTML }) => {
  i18n.locale('en')
  return replyWithHTML(i18n.t('greeting'))
})
bot.command('de', ({ i18n, replyWithHTML }) => {
  i18n.locale('de')
  return replyWithHTML(i18n.t('greeting'))
})

// We can get bot nickname from bot informations. This is particularly useful for groups.
bot.telegram.getMe().then((botInfo) => {
  bot.options.username = botInfo.username
  console.log('Server has initialized bot nickname. Nick: ' + botInfo.username)
})

bot.start(({ i18n, replyWithHTML }) => replyWithHTML(i18n.t('greeting')))
bot.help((ctx) => ctx.reply('🆘'))

// greeting
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.command('oldschool', (ctx) => ctx.reply('Hello'))
bot.command('modern', ({ reply }) => reply('Yo'))
bot.command('hipster', Telegraf.reply('λ'))

bot.use(session())
bot.command('count', (ctx) => {
  ctx.session.counter = ctx.session.counter || 0
  ctx.session.counter++
  return ctx.reply(`Counter: ${ctx.session.counter}`)
})

// essen
// bot.command('essen', (ctx) => ctx.telegram.sendPoll('group id', '2b|!2b', ['Ja', 'Nein']))

bot.command('dinner', Composer.groupChat(
  (ctx) => ctx.replyWithPoll('To eat or not to eat?', ['Ja', 'Nein'])
))
// Inline query support (@yourbot query)
bot.on('inline_query', ctx => {
  const query = ctx.update.inline_query.query

  if (query.startsWith('/')) { // If user input is @yourbot /command
    if (query.startsWith('/audio_src')) { // If user input is @yourbot /audio_src
      // In this case we answer with a list of ogg voice data.
      // It will be shown as a tooltip. You can add more than 1 element in this JSON array. Check API usage "InlineResultVoice".
      return ctx.answerInlineQuery([
        {
          type: 'voice', // It's a voice file.
          id: ctx.update.inline_query.id, // We reflect the same ID of the request back.
          title: 'Send audio file sample.ogg', // Message appearing in tooltip.
          voice_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg',
          voice_duration: 16, // We can specify optionally the length in seconds.
          caption: '[BOT] Audio file sample.ogg!' // What appears after you send voice file.
        }
      ])
    }
  } else {  // If user input is @yourbot name
    let nameTarget = query    // Let's assume the query is actually the name.
    if (nameTarget.length > 0) {
      const messageOptions = [
        'IMHO, ' + nameTarget + ' sucks.',
        'IMHO, ' + nameTarget + ' is awesome'
      ]
      const dice = Math.floor(Math.random() * messageOptions.length) // Let's throw a dice for a random message. (1, 8)
      const fullMessage = messageOptions[dice]
      // Let's return a single tooltip, not cached (In order to always change random value).
      return ctx.answerInlineQuery([{
        type: 'article',
        id: ctx.update.inline_query.id,
        title: 'You have inserted: ' + nameTarget,
        description: 'What does ' + bot.options.username + ' think about ' + nameTarget + '?',
        input_message_content: { message_text: fullMessage }
      }], { cache_time: 0 })
    }
  }
})

// fun
bot.hears('ymca', (ctx) => ctx.reply("*sing* It's fun to stay at the Y.M.C.A.!"))
bot.hears('fuck', (ctx) => ctx.reply("That's not a nice thing to say, bitch!"))
bot.command('rickroll', ({ reply }) => reply('Yo'))

bot.command('quit', (ctx) => {
  // Explicit usage
  ctx.telegram.leaveChat(ctx.message.chat.id)

  // Using shortcut
  ctx.leaveChat()
})

// Start bot polling in order to not terminate Node.js application.
bot.startPolling()
bot.launch()
