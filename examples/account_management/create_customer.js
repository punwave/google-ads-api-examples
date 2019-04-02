'use strict'

require('dotenv').config()

const parseArgs = require('minimist')
const moment = require('moment')
const { GoogleAdsClient, CreateCustomerClientRequest, Customer } = require('google-ads-node')
const { StringValue, BoolValue } = require('google-protobuf/google/protobuf/wrappers_pb')

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
  const { managerCustomerId } = parseArgs(process.argv.slice(2), { string: ['managerCustomerId'] })

  const service = client.getService('CustomerService')

  const customer = new Customer()
  customer.setDescriptiveName(new StringValue([`Account created with CustomerService on ${moment().format('YYYYMMDD HH:mm:ss')}`]))
  customer.setCurrencyCode(new StringValue([ 'USD' ]))
  customer.setTimeZone(new StringValue(['Asia/Taipei']))
  customer.setTrackingUrlTemplate(new StringValue(['{lpurl}?device={device}']))
  customer.setFinalUrlSuffix(new StringValue(['keyword={keyword}&matchtype={matchtype}&adgroupid={adgroupid}']))
  customer.setHasPartnersBadge(new BoolValue([false]))

  const request = new CreateCustomerClientRequest()
  request.setCustomerId(managerCustomerId)
  request.setCustomerClient(customer)

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
