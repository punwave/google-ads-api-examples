'use strict'

require('dotenv').config()

const parseArgs = require('minimist')
const {
  GoogleAdsClient,
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
  const { customerId, adGroupId } = parseArgs(process.argv.slice(2), { string: ['customerId', 'adGroupId'] })

  const adGroupResourceName = `customers/${customerId}/adGroups/${adGroupId}`
  const adGroupOperation = new AdGroupOperation()
  adGroupOperation.setRemove(adGroupResourceName)

  const service = client.getService('AdGroupService')

  const request = new MutateAdGroupsRequest()
  request.setCustomerId(customerId)
  request.setOperationsList([adGroupOperation])

  try {
    const response = await service.mutateAdGroups(request)
    const removedAdGroup = response.getResultsList()[0]
    console.log(`Removed ad group with resource name: '%s'`, removedAdGroup.getResourceName())
  } catch (e) {
    console.log(e)
  }
})()
