'use strict'

require('dotenv').config()

const parseArgs = require('minimist')
const { GoogleAdsClient, SearchGoogleAdsRequest } = require('google-ads-node')

/* Make sure to set your own authentication details here */
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REFRESH_TOKEN = process.env.REFRESH_TOKEN
const DEVELOPER_TOKEN = process.env.DEVELOPER_TOKEN
const LOGIN_CUSTOMER_ID = process.env.LOGIN_CUSTOMER_ID

/* Create a new GoogleAdsClient instance */
const client = new GoogleAdsClient({
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  refresh_token: REFRESH_TOKEN,
  developer_token: DEVELOPER_TOKEN,
  login_customer_id: LOGIN_CUSTOMER_ID
})

;(async function main () {
  const { customerId, campaignId } = parseArgs(process.argv.slice(2), { string: ['customerId', 'campaignId'] })

  const service = client.getService('GoogleAdsService')

  const request = new SearchGoogleAdsRequest()
  request.setCustomerId(customerId)
  let query = `
    SELECT campaign.id, ad_group.id, ad_group.name
    FROM ad_group
  `
  if (campaignId) query += ` WHERE campaign.id = ${campaignId}`
  request.setQuery(query)
  request.setPageSize(1000)

  try {
    const results = await service.search(request)

    for (const row of results.getResultsList()) {
      console.log(
        `Ad group with ID %d and name '%s' was found in campaign with ID %d.`,
        row.getAdGroup().getId().getValue(),
        row.getAdGroup().getName().getValue(),
        row.getAdGroup().getId().getValue()
      )
    }
  } catch (e) {
    console.log(e)
  }
})()
