'use strict'

require('dotenv').config()

const http = require('http')
const url = require('url')
const { google } = require('googleapis')
const opn = require('opn')
const destroyer = require('server-destroy')

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URL = 'http://localhost:3000/oauth2callback'
const SCOPES = ['https://www.googleapis.com/auth/adwords']

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)

/**
 * Open an http server to accept the oauth callback. In this simple example, the only request to our webserver is to /callback?code=<code>
 */
async function authenticate (scopes) {
  return new Promise((resolve, reject) => {
    // grab the url that will be used for authorization
    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes
    })
    const server = http
      .createServer(async (req, res) => {
        try {
          if (req.url.indexOf('/oauth2callback') > -1) {
            const qs = new url.URL(req.url, 'http://localhost:3000')
              .searchParams
            res.end('Authentication successful! Please return to the console.')
            server.destroy()
            const { tokens } = await oauth2Client.getToken(qs.get('code'))
            oauth2Client.credentials = tokens
            resolve(oauth2Client)
          }
        } catch (e) {
          reject(e)
        }
      })
      .listen(3000, () => {
        // open the browser to the authorize url to start the workflow
        opn(authorizeUrl, { wait: false }).then(cp => cp.unref())
      })
    destroyer(server)
  })
}

authenticate(SCOPES)
  .then(client => {
    const tokens = client.credentials
    console.log('Your refresh token is:', tokens.refresh_token)
  })
