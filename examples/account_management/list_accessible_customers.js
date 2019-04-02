'use strict'

require('dotenv').config()

const { GoogleAdsClient, ListAccessibleCustomersRequest } = require('google-ads-node')

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
  developer_token: DEVELOPER_TOKEN,

  /* This option unmarshals the gRPC response blobs to plain Javscript objects automatically */
  parseResults: true
})

;(async function main () {
  // Load a Customer Service
  const service = client.getService('CustomerService')

  // Create a new service request
  const request = new ListAccessibleCustomersRequest()

  // Call the ListAccessibleCustomers method of the CustomerService (Note: Methods are camel case in this library)
  const response = await service.listAccessibleCustomers(request)

  console.log('Total results:', Object.values(response).length)

  Object.values(response.resourceNames).forEach(customerResourceName => {
    console.log(`Customer resource name: '${customerResourceName}'`)
  })
})()
