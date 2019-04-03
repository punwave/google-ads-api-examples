'use strict'

require('dotenv').config()

const parseArgs = require('minimist')
const { GoogleAdsClient, CampaignStatusEnum, CampaignOperation, MutateCampaignsRequest } = require('google-ads-node')
const { getFieldMask } = require('google-ads-node/build/lib/utils')

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

  // Creates a campaign object with the specified resource name and other changes.
  const campaign = {
    resource_name: `customers/${customerId}/campaigns/${campaignId}`,
    status: CampaignStatusEnum.CampaignStatus.PAUSED
  }

  // Constructs an operation that will update the campaign with the specified resource name,
  // using the FieldMasks utility to derive the update mask. This mask tells the Google Ads
  // API which attributes of the campaign you want to change.
  const campaignOperation = new CampaignOperation()

  const pb = client.buildResource('Campaign', campaign)
  campaignOperation.setUpdate(pb)

  const mask = getFieldMask(campaign)
  campaignOperation.setUpdateMask(mask)

  const service = client.getService('CampaignService')

  const request = new MutateCampaignsRequest()
  request.setCustomerId(customerId)
  request.setOperationsList([campaignOperation])

  try {
    const response = await service.mutateCampaigns(request)
    const updatedCampaign = response.getResultsList()[0]
    console.log(`Updated campaign with resource name: '%s'`, updatedCampaign.getResourceName())
  } catch (e) {
    console.log(e)
  }
})()
