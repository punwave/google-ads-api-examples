'use strict'

require('dotenv').config()

const http = require('http')
const url = require('url')
const opn = require('opn')
const destroyer = require('server-destroy')
const inquirer = require('inquirer')
const { google } = require('googleapis')

/**
 * Open an http server to accept the oauth callback. In this simple example, the only request to our webserver is to /callback?code=<code>
 */
async function authenticate (oauth2Client, scopes) {
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
            res.end('Your refresh token has been fetched. Check the console output for further instructions.')
            server.destroy()
            const { tokens } = await oauth2Client.getToken(qs.get('code'))
            oauth2Client.credentials = tokens
            resolve(tokens)
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

;(async function main () {
  const redirectUri = 'http://localhost:3000/oauth2callback'
  const scopes = ['https://www.googleapis.com/auth/adwords']

  const { clientId, clientSecret } = await inquirer.prompt([
    {
      type: 'input',
      name: 'clientId',
      message: 'Enter your OAuth2 client ID here:',
      default: process.env.CLIENT_ID
    },
    {
      type: 'input',
      name: 'clientSecret',
      message: 'Enter your OAuth2 client secret here:',
      default: process.env.CLIENT_SECRET
    }
  ])

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  const authUrl = oauth2Client.generateAuthUrl({ scope: scopes })
  console.log(`Log into the Google account you use for Google Ads and visit the following URL:\n${authUrl}\n`)

  authenticate(oauth2Client, scopes)
    .then(tokens => {
      console.log(`Your refresh token is: ${tokens.refresh_token}\n`)
    })
    .catch(err => {
      console.log(err)
    })
})()
