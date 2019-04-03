'use strict'

require('dotenv').config()

const parseArgs = require('minimist')
const { GoogleAdsClient, AdGroupStatusEnum, AdGroupOperation, MutateAdGroupsRequest } = require('google-ads-node')
const { getFieldMask } = require('google-ads-node/build/lib/utils')

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
  const { customerId, adGroupId, cpcBidMicroAmount } = parseArgs(process.argv.slice(2), { string: ['customerId', 'adGroupId'] })

  const adGroup = {
    resource_name: `customers/${customerId}/adGroups/${adGroupId}`,
    cpc_bid_micros: cpcBidMicroAmount,
    status: AdGroupStatusEnum.AdGroupStatus.PAUSED
  }

  // Constructs an operation that will update the campaign with the specified resource name,
  // using the FieldMasks utility to derive the update mask. This mask tells the Google Ads
  // API which attributes of the campaign you want to change.
  const adGroupOperation = new AdGroupOperation()

  const pb = client.buildResource('AdGroup', adGroup)
  adGroupOperation.setUpdate(pb)

  const mask = getFieldMask(adGroup)
  adGroupOperation.setUpdateMask(mask)

  const service = client.getService('AdGroupService')

  const request = new MutateAdGroupsRequest()
  request.setCustomerId(customerId)
  request.setOperationsList([adGroupOperation])

  try {
    const response = await service.mutateAdGroups(request)
    const updatedAdGroup = response.getResultsList()[0]
    console.log(`Updated ad group with resource name: '%s'`, updatedAdGroup.getResourceName())
  } catch (e) {
    console.log(e)
  }
})()
