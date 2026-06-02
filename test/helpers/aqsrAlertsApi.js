import config from './config.js'
import proxyFetch from './proxy-fetch.js'
import createLogger from './logger.js'
import dayjs from 'dayjs'

const logger = createLogger()

const ONE_DAY_MS = 24 * 60 * 60 * 1000

// Step 9 - obtain a bearer token from the login_check endpoint
async function getAqsrToken() {
  const loginUrl = config.get('siteMetaDataLoginUrl')
  logger.info(`[AQSR] Requesting bearer token from ${loginUrl}`)
  const response = await proxyFetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: config.get('aqsrAlertsApiEmail'),
      password: config.get('aqsrAlertsApiPwd')
    })
  })
  if (!response.ok) {
    logger.error(`[AQSR] login_check failed with status ${response.status}`)
    throw new Error(`AQSR login_check failed: ${response.status}`)
  }
  const data = await response.json()
  if (!data || !data.token) {
    logger.error('[AQSR] login_check response did not contain a token')
    throw new Error('AQSR login_check response missing token')
  }
  logger.info('[AQSR] Bearer token received successfully')
  return data.token
}

// Step 9 - query the aqsr_alerts endpoint for the given date range (page 1)
async function fetchAqsrAlerts(token, startDate, endDate) {
  const baseUrl = config.get('aqsrAlertsUrl')
  const apiUrl = `${baseUrl}?page=1&start-date=${startDate}&end-date=${endDate}`
  logger.info(`[AQSR] GET ${apiUrl}`)
  const response = await proxyFetch(apiUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!response.ok) {
    logger.error(
      `[AQSR] aqsr_alerts fetch failed with status ${response.status}`
    )
    throw new Error(`AQSR aqsr_alerts fetch failed: ${response.status}`)
  }
  const data = await response.json()
  const memberLength = Array.isArray(data.member) ? data.member.length : 'n/a'
  logger.info(
    `[AQSR] Response totalItems=${data.totalItems}, member length=${memberLength}`
  )
  return data
}

/**
 * Step 9 - returns the number of active air pollution breaches.
 *
 * Logic:
 *  - start-date = yesterday, end-date = today
 *  - parse the JSON response and read the "member" array
 *  - keep only items whose "date" is within the last 24 hours from now
 *  - from those items, count the unique "samplingPointId" (sampling ID) values
 */
export async function getActiveBreachCount() {
  const startDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
  const endDate = dayjs().format('YYYY-MM-DD')
  logger.info(`[AQSR] Using start-date=${startDate}, end-date=${endDate}`)

  const token = await getAqsrToken()
  const data = await fetchAqsrAlerts(token, startDate, endDate)

  const members = Array.isArray(data.member) ? data.member : []
  if (members.length === 0) {
    logger.info('[AQSR] No members returned - active breach count is 0')
    return 0
  }

  const now = Date.now()
  const cutoff = now - ONE_DAY_MS
  const last24HoursItems = members.filter((item) => {
    if (!item || !item.date) {
      logger.info('[AQSR] Skipping member without a date field')
      return false
    }
    const itemTime = new Date(item.date).getTime()
    return itemTime >= cutoff && itemTime <= now
  })
  logger.info(
    `[AQSR] Members within the last 24 hours: ${last24HoursItems.length}`
  )

  const uniqueSamplingIds = new Set(
    last24HoursItems.map((item) => item.samplingPointId)
  )
  logger.info(
    `[AQSR] Unique samplingPointId count (last 24h): ${uniqueSamplingIds.size} -> ${JSON.stringify(
      [...uniqueSamplingIds]
    )}`
  )

  return uniqueSamplingIds.size
}

/**
 * Returns the number of past air pollution breaches expected under
 * "Recorded in the last 12 months".
 *
 * Logic:
 *  - start-date = one year ago, end-date = today (dynamic, based on now)
 *  - parse the JSON response and read the "member" array (the 12-month items)
 *  - the past breaches list excludes the items from the last 24 hours, so the
 *    expected count = total 12-month items - items within the last 24 hours
 */
export async function getPastBreachCount() {
  const startDate = dayjs().subtract(1, 'year').format('YYYY-MM-DD')
  const endDate = dayjs().format('YYYY-MM-DD')
  logger.info(
    `[AQSR][Past] Using start-date=${startDate}, end-date=${endDate} (last 12 months)`
  )

  const token = await getAqsrToken()
  const data = await fetchAqsrAlerts(token, startDate, endDate)

  const members = Array.isArray(data.member) ? data.member : []
  logger.info(
    `[AQSR][Past] Total members in the last 12 months: ${members.length}`
  )
  if (members.length === 0) {
    logger.info('[AQSR][Past] No members returned - past breach count is 0')
    return 0
  }

  const now = Date.now()
  const cutoff = now - ONE_DAY_MS
  const last24HoursItems = members.filter((item) => {
    if (!item || !item.date) {
      logger.info('[AQSR][Past] Skipping member without a date field')
      return false
    }
    const itemTime = new Date(item.date).getTime()
    return itemTime >= cutoff && itemTime <= now
  })
  logger.info(
    `[AQSR][Past] Items within the last 24 hours (to be excluded): ${last24HoursItems.length}`
  )

  const pastBreachCount = members.length - last24HoursItems.length
  logger.info(
    `[AQSR][Past] Past breach count = ${members.length} (12 months) - ${last24HoursItems.length} (last 24h) = ${pastBreachCount}`
  )

  return pastBreachCount
}

export default getActiveBreachCount
