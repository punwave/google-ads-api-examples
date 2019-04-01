'use strict'

require('dotenv').config()

const readline = require('readline')
const { google } = require('googleapis')

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URL = 'urn:ietf:wg:oauth:2.0:oob'
const SCOPES = ['https://www.googleapis.com/auth/adwords']

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
const url = auth.generateAuthUrl({ scope: SCOPES })
console.log(`Paste this url in your browser:\n${url}`)

rl.question('Type the code you received here: ', async code => {
  try {
    const { tokens } = await auth.getToken(code)
    console.log('Your refresh token is:', tokens.refresh_token)
  } catch (err) {
    console.error(err)
  }
  rl.close()
})
