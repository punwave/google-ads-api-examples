'use strict'

require('dotenv').config()

const parseArgs = require('minimist')
const moment = require('moment')
const {
  GoogleAdsClient,
  ManualCpc,
  AdvertisingChannelTypeEnum,
  BudgetDeliveryMethodEnum,
  CampaignStatusEnum,
  CampaignBudgetOperation,
  CampaignOperation,
  MutateCampaignsRequest,
  MutateCampaignBudgetsRequest
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
  const { customerId } = parseArgs(process.argv.slice(2), { string: ['customerId'] })
  const NUMBER_OF_CAMPAIGNS_TO_ADD = 2

  const budgetResourceName = await addCampaignBudget(client, customerId)

  const campaignOperations = []
  for (let i = 0; i < NUMBER_OF_CAMPAIGNS_TO_ADD; i++) {
    const campaign = {
      name: `Interplanetary Cruise #${Date.now()}`,
      campaign_budget: budgetResourceName,
      network_settings: {
        target_google_search: true,
        target_search_network: true,
        target_content_network: false,
        target_partner_search_network: false
      },
      start_date: moment().add(1, 'days').format('YYYYMMDD'),
      end_date: moment().add(1, 'months').format('YYYYMMDD')
    }
    const pb = client.buildResource('Campaign', campaign)
    pb.setStatus(CampaignStatusEnum.CampaignStatus.ENABLED)
    pb.setAdvertisingChannelType(AdvertisingChannelTypeEnum.AdvertisingChannelType.SEARCH)
    pb.setManualCpc(new ManualCpc())

    const campaignOperation = new CampaignOperation()
    campaignOperation.setCreate(pb)
    campaignOperations.push(campaignOperation)
  }

  const service = client.getService('CampaignService')

  const request = new MutateCampaignsRequest()
  request.setCustomerId(customerId)
  request.setOperationsList(campaignOperations)

  try {
    const response = await service.mutateCampaigns(request)

    console.log('Added %d campaigns:', response.getResultsList().length)

    for (const addedCampaign of response.getResultsList()) {
      console.log(addedCampaign.getResourceName())
    }
  } catch (e) {
    console.log(e)
  }
})()

async function addCampaignBudget (googleAdsClient, customerId) {
  const budget = {
    name: `Interplanetary Cruise Budget #${Date.now()}`,
    delivery_method: BudgetDeliveryMethodEnum.BudgetDeliveryMethod.STANDARD,
    amount_micros: 500000
  }

  const campaignBudgetOperation = new CampaignBudgetOperation()
  campaignBudgetOperation.setCreate(client.buildResource('CampaignBudget', budget))

  const service = client.getService('CampaignBudgetService')

  const request = new MutateCampaignBudgetsRequest()
  request.setCustomerId(customerId)
  request.setOperationsList([campaignBudgetOperation])

  try {
    const response = await service.mutateCampaignBudgets(request)
    const addedBudget = response.getResultsList()[0]
    console.log(`Added budget named '%s'`, addedBudget.getResourceName())
    return addedBudget.getResourceName()
  } catch (e) {
    console.log(e)
  }
}
