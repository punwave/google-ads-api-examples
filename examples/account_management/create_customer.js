'use strict'

require('dotenv').config()

const parseArgs = require('minimist')
const moment = require('moment')
const { GoogleAdsClient, CreateCustomerClientRequest } = require('google-ads-node')

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
  const { managerCustomerId } = parseArgs(process.argv.slice(2), { string: ['managerCustomerId'] })

  const service = client.getService('CustomerService')

  const customer = {
    descriptive_name: `Account created with CustomerService on ${moment().format('YYYYMMDD HH:mm:ss')}`,
    currency_code: 'USD',
    time_zone: 'America/New_York',
    tracking_url_template: '{lpurl}?device={device}',
    final_url_suffix: 'keyword={keyword}&matchtype={matchtype}&adgroupid={adgroupid}',
    has_partners_badge: false
  }

  const request = new CreateCustomerClientRequest()
  request.setCustomerId(managerCustomerId)
  request.setCustomerClient(client.buildResource('Customer', customer))

  try {
    const response = await service.createCustomerClient(request)
    console.log(
      `Created a customer with resource name "%s" under the manager account with ` +
      `customer ID %s.`,
      response.getResourceName(),
      managerCustomerId
    )
  } catch (e) {
    console.log(e)
  }
})()
