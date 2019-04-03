'use strict'

require('dotenv').config()

const parseArgs = require('minimist')
const { GoogleAdsClient, CampaignOperation, MutateCampaignsRequest } = require('google-ads-node')

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
  const { customerId, campaignId } = parseArgs(process.argv.slice(2), { string: ['customerId', 'campaignId'] })

  const campaignResourceName = `customers/${customerId}/campaigns/${campaignId}`
  const campaignOperation = new CampaignOperation()
  campaignOperation.setRemove(campaignResourceName)

  const service = client.getService('CampaignService')

  const request = new MutateCampaignsRequest()
  request.setCustomerId(customerId)
  request.setOperationsList([campaignOperation])

  try {
    const response = await service.mutateCampaigns(request)
    const removedCampaign = response.getResultsList()[0]
    console.log(`Removed campaign with resource name: '%s'`, removedCampaign.getResourceName())
  } catch (e) {
    console.log(e)
  }
})()
