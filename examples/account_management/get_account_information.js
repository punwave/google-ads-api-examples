'use strict'

require('dotenv').config()

const parseArgs = require('minimist')
const { GoogleAdsClient, GetCustomerRequest } = require('google-ads-node')

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
  const { customerId } = parseArgs(process.argv.slice(2), { string: ['customerId'] })

  const service = client.getService('CustomerService')

  const request = new GetCustomerRequest()
  request.setResourceName(`customers/${customerId}`)

  const customer = await service.getCustomer(request)
  console.log(
    `Customer with ID %d, descriptive name '%s', currency code '%s', timezone '%s, ` +
    `tracking URL template '%s' and auto tagging enabled '%s' was retrieved.`,
    customer.getId().getValue(),
    customer.getDescriptiveName().getValue(),
    customer.getCurrencyCode().getValue(),
    customer.getTimeZone().getValue(),
    customer.getTrackingUrlTemplate() && customer.getTrackingUrlTemplate().getValue(),
    customer.getAutoTaggingEnabled().getValue() ? 'true' : 'false'
  )
})()
