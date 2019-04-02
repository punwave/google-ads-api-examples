'use strict'

require('dotenv').config()

const parseArgs = require('minimist')
const { GoogleAdsClient, SearchGoogleAdsRequest, ChangeStatusResourceTypeEnum } = require('google-ads-node')

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

  const service = client.getService('GoogleAdsService')

  const request = new SearchGoogleAdsRequest()
  request.setCustomerId(customerId)
  request.setQuery(`
    SELECT
      change_status.resource_name,
      change_status.last_change_date_time,
      change_status.resource_type,
      change_status.campaign,
      change_status.ad_group,
      change_status.resource_status,
      change_status.ad_group_ad,
      change_status.ad_group_criterion,
      change_status.campaign_criterion
    FROM change_status
    WHERE change_status.last_change_date_time DURING LAST_7_DAYS
    ORDER BY change_status.last_change_date_time
  `)
  request.setPageSize(1000)

  const results = await service.search(request)

  for (const row of results.getResultsList()) {
    console.log(
      `On %s, change status '%s' shows resource '%s' with type %d and status %d.`,
      row.getChangeStatus().getLastChangeDateTime().getValue(),
      row.getChangeStatus().getResourceName(),
      getResourceNameForResourceType(row.getChangeStatus()),
      row.getChangeStatus().getResourceType(),
      row.getChangeStatus().getResourceStatus()
    )
  }
})()

function getResourceNameForResourceType (changeStatus) {
  let resourceName = null
  // This is the list of all known resource names but may be subject to change in the future.
  // See https://developers.google.com/google-ads/api/docs/change-status for a description.
  switch (changeStatus.getResourceType()) {
    case ChangeStatusResourceTypeEnum.AD_GROUP:
      resourceName = changeStatus.getAdGroup().getValue()
      break
    case ChangeStatusResourceTypeEnum.AD_GROUP_AD:
      resourceName = changeStatus.getAdGroupAd().getValue()
      break
    case ChangeStatusResourceTypeEnum.AD_GROUP_CRITERION:
      resourceName = changeStatus.getAdGroup().getValue()
      break
    case ChangeStatusResourceTypeEnum.CAMPAIGN:
      resourceName = changeStatus.getCampaign().getValue()
      break
    case ChangeStatusResourceTypeEnum.CAMPAIGN_CRITERION:
      resourceName = changeStatus.getCampaignCriterion().getValue()
      break
  }
  return resourceName
}
