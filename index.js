import TelegramBot from 'node-telegram-bot-api'
import firebase from 'firebase'
import ogs from 'open-graph-scraper'
require('dotenv').config()

const token = process.env.TELEGRAM_BOT_KEY
const bot = new TelegramBot(token, { polling: true })

const app = firebase.initializeApp({
  apiKey: 'AIzaSyDyaZpW6hMifDRgsH2zDVDLk3rn_AlhuVc',
  authDomain: 'muensterer-family-bot.firebaseapp.com',
  databaseURL: 'https://muensterer-family-bot.firebaseio.com',
  projectId: 'muensterer-family-bot',
  storageBucket: 'muensterer-family-bot.appspot.com',
  messagingSenderId: '829502478654',
  appId: '1:829502478654:web:9639573d381c55628d346f',
  measurementId: 'G-XS119B3XR5'
})

const ref = firebase.database().ref()
const sitesRef = ref.child('sites')

// In-memory storage
const URLs = []
const URLLabels = []
let tempSiteURL = ''

// bot.on('text', (message) => {
//   bot.sendMessage(message.chat.id, 'Hello world')
// })

// Listener (handler) for telegram's /bookmark event
bot.onText(/\/bookmark/, (msg, match) => {
  const chatId = msg.chat.id
  const url = match.input.split(' ')[1]
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  if (url === undefined) {
    bot.sendMessage(
      chatId,
      'Please provide URL of article!',
    )
    return
  }

  URLs.push(url)
  bot.sendMessage(
    chatId,
    'URL has been successfully saved!'
  )
})

// Listener (handler) for telegram's /label event
bot.onText(/\/label/, (msg, match) => {
  const chatId = msg.chat.id
  const url = match.input.split(' ')[1]

  if (url === undefined) {
    bot.sendMessage(
      chatId,
      'Please provide URL of article!',
    )
    return
  }

  tempSiteURL = url
  bot.sendMessage(
        chatId,
        'URL has been successfully saved!',
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: 'Development',
            callback_data: 'development'
          },
          {
            text: 'Recipes',
            callback_data: 'recipes'
          }, {
            text: 'Places to go',
            callback_data: 'places'
          }, {
            text: 'Other',
            callback_data: 'other'
          }
        ]]
      }
    }
  )
})

// Listener (handler) for callback data from /label command
bot.on('callback_query', (callbackQuery) => {
  const { message, category } = callbackQuery

  // URLLabels.push({
  //   url: tempSiteURL,
  //   label: category
  // })

  ogs({ url: tempSiteURL }, function (results) {
    if (results.success) {
      sitesRef.push().set({
        name: results.data.ogSiteName,
        title: results.data.ogTitle,
        description: results.data.ogDescription,
        url: tempSiteURL,
        thumbnail: results.data.ogImage.url,
        category: category
      })
      bot.sendMessage(message.chat.id, 'Added "' + results.data.ogTitle + '" to category "' + callbackQuery.data + '"!')
    } else {
      sitesRef.push().set({
        url: tempSiteURL
      })
      bot.sendMessage(message.chat.id, 'Added new website, but there was no OG data!')
    }
  })
  tempSiteURL = ''
  // bot.sendMessage(message.chat.id, `URL has been labeled with category "${category}"`)
})

bot.onText(/\/list/, (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(
      chatId,
        `${URLs.toString() || 'No bookmarks stored'}`, {
          parse_mode: 'HTML'
        }
    )
})

// Listener (handler) for showcasing different keyboard layout
bot.onText(/\/keyboard/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Alternative keyboard layout', {
    'reply_markup': {
      'keyboard': [['Sample text', 'Second sample'], ['Keyboard'], ['I\'m robot']],
      resize_keyboard: true,
      one_time_keyboard: true,
      force_reply: true
    }
  })
})

// Inline keyboard options
const inlineKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: 'YES',
          callback_data: JSON.stringify({
            'command': 'mycommand1',
            'answer': 'YES'
          })
        },
        {
          text: 'NO',
          callback_data: JSON.stringify({
            'command': 'mycommand1',
            'answer': 'NO'
          })
        }
      ]
    ]
  }
}

// Listener (handler) for showcasing inline keyboard layout
bot.onText(/\/inline/, (msg) => {
  bot.sendMessage(msg.chat.id, 'You have to agree with me, OK?', inlineKeyboard)
})

// Keyboard layout for requesting phone number access
const requestPhoneKeyboard = {
  'reply_markup': {
    'one_time_keyboard': true,
    'keyboard': [[{
      text: 'My phone number',
      request_contact: true,
      one_time_keyboard: true
    }], ['Cancel']]
  }
}

// Listener (handler) for retrieving phone number
bot.onText(/\/phone/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Can we get access to your phone number?', requestPhoneKeyboard)
})

// Handler for phone number request when user gives permission
bot.on('contact', async (msg) => {
  const phone = msg.contact.phone_number
  bot.sendMessage(msg.chat.id, `Phone number saved: ${phone}`)
})

// Listener (handler) for telegram's /start event
// This event happened when you start the conversation with both by the very first time
// Provide the list of available commands
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(
      chatId,
        `
            Welcome at <b>FamilyBot</b>,

            Available commands:

            /bookmark <b>URL</b> - save interesting article URL
            /list - list currently saved bookmarks
        `, {
          parse_mode: 'HTML'
        }
    )
})

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id
  const availableCommands = [
    { title: 'bookmark', params: '<b>URL<b>', description: 'save interesting article URL' },
    { title: 'label', params: '<b>URL<b>', description: 'save interesting article URL with label' },
    { title: 'list', params: '', description: 'list saved bookmarks' }
  ]
  // ${availableCommands[0].title} <b>${availableCommands[0].params}<b> - ${availableCommands[0].description}
  bot.sendMessage(
    chatId,
    `
        Available commands:
        ${availableCommands.map(command => {
          const line = '/' + command.title + ' ' + command.params + ' - ' + command.description
          console.log('line', line)
          return line
        })}
    `, {
      parse_mode: 'HTML'
    }
  )
})
