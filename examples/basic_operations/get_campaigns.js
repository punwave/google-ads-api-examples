'use strict'

require('dotenv').config()

const parseArgs = require('minimist')
const { GoogleAdsClient, SearchGoogleAdsRequest } = require('google-ads-node')

/* Make sure to set your own authentication details here */
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REFRESH_TOKEN = process.env.REFRESH_TOKEN
const DEVELOPER_TOKEN = process.env.DEVELOPER_TOKEN

/* Create a new GoogleAdsClient instance */
const client = new GoogleAdsClient({
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  refresh_token: REFRESH_TOKEN,
  developer_token: DEVELOPER_TOKEN
})

;(async function main () {
  const { customerId } = parseArgs(process.argv.slice(2), { string: ['customerId'] })

  const service = client.getService('GoogleAdsService')

  const request = new SearchGoogleAdsRequest()
  request.setCustomerId(customerId)
  request.setQuery(`
    SELECT campaign.id, campaign.name
    FROM campaign
    ORDER BY campaign.id
  `)
  request.setPageSize(1000)

  try {
    const results = await service.search(request)

    for (const row of results.getResultsList()) {
      console.log(
        `Campaign with ID %d and name '%s' was found.`,
        row.getCampaign().getId().getValue(),
        row.getCampaign().getName().getValue()
      )
    }
  } catch (e) {
    console.log(e)
  }
})()
