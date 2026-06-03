import config from './config.js'
import proxyFetch from './proxy-fetch.js'
import createLogger from './logger.js'
import dayjs from 'dayjs'

const logger = createLogger()

const ONE_DAY_MS = 24 * 60 * 60 * 1000

// Resolve URLs and credentials once, up front (same pattern as
// newRicardoValidation.js which uses proxyFetch successfully).
const LOGIN_URL = config.get('siteMetaDataLoginUrl')
const ALERTS_URL = config.get('aqsrAlertsUrl')
const EMAIL = config.get('aqsrAlertsApiEmail')
const PASSWORD = config.get('aqsrAlertsApiPwd')

// Logs the underlying transport cause of an undici "fetch failed" error, which
// is otherwise hidden. This is what tells us WHY the connection failed
// (DNS / connection refused / proxy / TLS / timeout) in a given environment.
function logFetchFailure(label, err) {
  const proxy = config.get('httpsProxy') ?? config.get('httpProxy')
  const cause = err?.cause
  logger.error(
    `[AQSR] ${label} failed at the network level: ${err?.message} | proxy: ${
      proxy || 'none (direct connection)'
    } | cause.code: ${cause?.code} | cause.message: ${cause?.message} | cause: ${JSON.stringify(
      cause,
      Object.getOwnPropertyNames(cause || {})
    )}`
  )
}

// Step 9 - obtain a bearer token from the login_check endpoint
async function getAqsrToken() {
  const proxy = config.get('httpsProxy') ?? config.get('httpProxy')
  logger.info(
    `[AQSR] Requesting bearer token from ${LOGIN_URL} (proxy: ${proxy || 'none (direct connection)'})`
  )
  let response
  try {
    response = await proxyFetch(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD
      })
    })
  } catch (err) {
    logFetchFailure('login_check', err)
    throw err
  }
  let data
  if (response.ok) {
    data = await response.json()
  }
  logger.info(`[AQSR] login_check response status: ${response.status}`)
  logger.info(`[AQSR] Bearer token received: ${data?.token ? 'YES' : 'NO'}`)
  return data?.token
}

// Step 9 - query the aqsr_alerts endpoint for the given date range (page 1)
async function fetchAqsrAlerts(token, startDate, endDate) {
  const apiUrl = `${ALERTS_URL}?page=1&start-date=${startDate}&end-date=${endDate}`
  logger.info(`[AQSR] GET ${apiUrl}`)
  let response
  try {
    response = await proxyFetch(apiUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (err) {
    logFetchFailure('aqsr_alerts', err)
    throw err
  }
  let data
  if (response.ok) {
    data = await response.json()
  }
  const memberLength =
    data && Array.isArray(data.member) ? data.member.length : 'n/a'
  logger.info(
    `[AQSR] aqsr_alerts response status: ${response.status}, totalItems=${data?.totalItems}, member length=${memberLength}`
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

  const members = data && Array.isArray(data.member) ? data.member : []
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

  const members = data && Array.isArray(data.member) ? data.member : []
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
