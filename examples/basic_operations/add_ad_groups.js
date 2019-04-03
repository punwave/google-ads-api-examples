'use strict'

require('dotenv').config()

const parseArgs = require('minimist')
const {
  GoogleAdsClient,
  AdGroupStatusEnum,
  AdGroupTypeEnum,
  AdGroupOperation,
  MutateAdGroupsRequest
} = require('google-ads-node')

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

  const campaignResourceName = `customers/${customerId}/campaigns/${campaignId}`

  const operations = []

  const adgroup1 = {
    name: `Earth to Mars Cruises #${Date.now()}`,
    campaign: campaignResourceName,
    status: AdGroupStatusEnum.AdGroupStatus.ENABLED,
    type: AdGroupTypeEnum.AdGroupType.SEARCH_STANDARD,
    cpc_bid_micros: 10000000
  }
  const adGroupOperation1 = new AdGroupOperation()
  adGroupOperation1.setCreate(client.buildResource('AdGroup', adgroup1))
  operations.push(adGroupOperation1)

  const adgroup2 = {
    name: `Earth to Mars Cruises #${Date.now()}`,
    campaign: campaignResourceName,
    status: AdGroupStatusEnum.AdGroupStatus.ENABLED,
    type: AdGroupTypeEnum.AdGroupType.SEARCH_STANDARD,
    cpc_bid_micros: 20000000
  }
  const adGroupOperation2 = new AdGroupOperation()
  adGroupOperation2.setCreate(client.buildResource('AdGroup', adgroup2))
  operations.push(adGroupOperation2)

  const service = client.getService('AdGroupService')

  const request = new MutateAdGroupsRequest()
  request.setCustomerId(customerId)
  request.setOperationsList(operations)

  try {
    const response = await service.mutateAdGroups(request)

    console.log('Added %d ad groups:', response.getResultsList().length)

    for (const addedAdGroup of response.getResultsList()) {
      console.log(addedAdGroup.getResourceName())
    }
  } catch (e) {
    console.log(e)
  }
})()
