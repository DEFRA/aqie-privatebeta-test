/* eslint-disable prettier/prettier */
import startNowPage from '../page-objects/startnowpage.js'
import locationSearchPage from '../page-objects/locationsearchpage.js'
import ForecastMainPage from '../page-objects/forecastmainpage.js'
import LocationMatchPage from '../page-objects/locationmatchpage.js'
import config from '../helpers/config.js'
import moment from 'moment-timezone'
import cookieBanner from '../page-objects/cookieBanner.js'
import { browser, expect } from '@wdio/globals'
import fs from 'node:fs'
import createLogger from '../helpers/logger.js'
import proxyFetch from '../helpers/proxy-fetch.js'
const optionsJson = { method: 'GET', headers: { 'Content-Type': 'text/json' } }
const dynlocationValue = JSON.parse(
  fs.readFileSync('test/testdata/dynamicForecast.json')
)

const calendarEnglish = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

const calendarWelsh = [
  'Ionawr',
  'Chwefror',
  'Mawrth',
  'Ebrill',
  'Mai',
  'Mehefin',
  'Gorffennaf',
  'Awst',
  'Medi',
  'Hydref',
  'Tachwedd',
  'Rhagfyr'
]

async function timeStampUKSummary() {
  const primaryUrl = config.get('forecastUrl')
  const fallbackUrl = config.get('ephemeralForecastUrl')
  const fallbackApiKey = config.get('ephemeralApiKey')

  logger.info(`[fetchForecast] Attempting primary URL: ${primaryUrl}`)

  // Try primary URL first
  let response = await proxyFetch(primaryUrl, optionsJson).catch((err) => {
    logger.info(
      `[fetchForecast] Primary URL error: ${JSON.stringify(err.message)}`
    )
    return null
  })

  // Check if primary URL returned 200 OK
  if (!response || response.status !== 200) {
    logger.info(
      `[fetchForecast] Primary URL failed with status: ${response?.status || 'no response'}. Trying fallback URL...`
    )

    // Use fallback URL with API key
    const optionsWithApiKey = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': '*',
        'x-api-key': fallbackApiKey
      }
    }

    logger.info(`[fetchForecast] Attempting fallback URL: ${fallbackUrl}`)
    response = await proxyFetch(fallbackUrl, optionsWithApiKey).catch((err) => {
      logger.error(
        `[fetchForecast] Fallback URL error: ${JSON.stringify(err.message)}`
      )
      return null
    })

    if (!response || !response.ok) {
      logger.error(
        `[fetchForecast] Fallback URL also failed with status: ${response?.status || 'no response'}`
      )
      return null
    }

    logger.info('[fetchForecast] Successfully fetched data from fallback URL')
  } else {
    logger.info('[fetchForecast] Successfully fetched data from primary URL')
  }

  try {
    const metOfficeForecastJsonResponse = await response.json()

    if (
      !metOfficeForecastJsonResponse ||
      !metOfficeForecastJsonResponse['forecast-summary']
    ) {
      logger.error(
        '[fetchForecast] Invalid response format: missing forecast-summary data'
      )
      return null
    }

    // Store the full response globally so getDailySummary can access forecast-summary
    const ukForecastSummary = metOfficeForecastJsonResponse['forecast-summary']

    // Parse the issue_date to extract date and time
    const issueDateTime = moment(ukForecastSummary.issue_date)
    const formattedDateSummary = issueDateTime.format('DD MMMM YYYY').split(' ')

    // Extract time in 12-hour format with am/pm
    const hours = issueDateTime.format('h')
    const minutes = issueDateTime.format('mm')
    const ampm = issueDateTime.format('a')
    const formattedTime = `${hours}:${minutes}${ampm}`

    const getMonthSummary = calendarEnglish.findIndex(function (item) {
      return item.indexOf(formattedDateSummary[1]) !== -1
    })
    const englishDate = `${formattedDateSummary[0]} ${calendarEnglish[getMonthSummary]} ${formattedDateSummary[2]}`
    const welshDate = `${formattedDateSummary[0]} ${calendarWelsh[getMonthSummary]} ${formattedDateSummary[2]}`

    const finalValue = {
      englishDate: `Latest at ${formattedTime} on ${englishDate}`,
      welshDate: `Y diweddaraf am ${formattedTime} ymlaen ${welshDate}`
    }
    return finalValue
  } catch (err) {
    logger.error(`[fetchForecast] Error parsing response: ${err.message}`)
    return null
  }
}

const logger = createLogger()
dynlocationValue.forEach(
  ({
    region,
    nearestRegionForecast,
    nearestRegionPollutantsSta1,
    nearestRegionPollutantsSta2,
    nearestRegionPollutantsSta3,
    NI
  }) => {
    describe('DAQI Main Page - Timestamp Validation', () => {
      it('UK-Forecast-Timestamp', async () => {
        logger.info('--- UK-Forecast-Timestamp StartScenario--------')
        await browser.deleteCookies(['airaqie_cookie'])
        await browser.url('')
        await browser.maximizeWindow()
        // Handle the cookie banner
        if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
          await cookieBanner.rejectButtonCookiesDialog.click()
          await cookieBanner.hideButtonHideDialog.click()
        }
        await startNowPage.startNowBtnClick()
        if (NI === 'No') {
          await locationSearchPage.clickESWRadiobtn()
          await locationSearchPage.setUserESWRegion(region)
        } else if (NI === 'Yes') {
          await locationSearchPage.clickNIRadiobtn()
          await locationSearchPage.setUserNIRegion(region)
        }
        await locationSearchPage.clickContinueBtn()
        if (await LocationMatchPage.headerTextMatch.isExisting()) {
          await LocationMatchPage.firstLinkOfLocationMatch.click()
        }
        // get timestamp from PHP URL
        const engWelDates = await timeStampUKSummary()
        await ForecastMainPage.timestampBlockForecastPage.scrollIntoView()
        const getTimeStampEnglish =
          await ForecastMainPage.timestampBlockForecastPage.getText()
        await expect(getTimeStampEnglish).toMatch(engWelDates.englishDate)

        // Check pollutant table
        await ForecastMainPage.timestandPollutantTable1.scrollIntoView()
        // await browser.saveScreenshot(path.join(global.screenshotFolder, 'timestandPollutantTable1.png'));
        // const getTimeStampEnglishPollutantTable1 =
        // await ForecastMainPage.timestandPollutantTable1.getText()
        // await expect(getTimeStampEnglishPollutantTable1).toMatch(`Latest measurement at (\d+)pm on (\d+) December (\d+)`)
        // Click Welsh Toogle button
        await locationSearchPage.linkButtonWelsh.click()
        await ForecastMainPage.timestampBlockForecastPage.scrollIntoView()
        const getTimeStampWelsh =
          await ForecastMainPage.timestampBlockForecastPage.getText()
        await expect(getTimeStampWelsh).toMatch(engWelDates.welshDate)
        // Click English Toogle button
        await locationSearchPage.linkButtonEnglish.click()
        await browser.deleteCookies(['airaqie_cookie'])
        logger.info('--- UK-Forecast-Timestamp EndScenario--------')
      })
    })
  }
)
