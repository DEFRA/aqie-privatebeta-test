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
  const forecastSummaryUrl = config.get('forecastSummaryUrl')
  const response = await proxyFetch(`${forecastSummaryUrl}`, optionsJson).catch(
    (err) => {
      logger.info(`err ${JSON.stringify(err.message)}`)
    }
  )
  let ukForecastSummary
  if (response.ok) {
    ukForecastSummary = await response.json()
    const formattedDateSummary = moment(ukForecastSummary.issue_date)
      .format('DD MMMM YYYY')
      .split(' ')

    const getMonthSummary = calendarEnglish.findIndex(function (item) {
      return item.indexOf(formattedDateSummary[1]) !== -1
    })
    const englishDate = `${formattedDateSummary[0]} ${calendarEnglish[getMonthSummary]} ${formattedDateSummary[2]}`
    const welshDate = `${formattedDateSummary[0]} ${calendarWelsh[getMonthSummary]} ${formattedDateSummary[2]}`

    // const getTimeOfSummary1 = ukForecastSummary.issue_date.split(' ')
    // const getTimeOfSummary2 = getTimeOfSummary1[1].split(':')
    // const getDateInCorrectFormat = getTimeOfSummary2[0].replace(/^0+/, '')
    const finalValue = {
      englishDate: `Latest at 5am on ${englishDate}`,
      welshDate: `Y diweddaraf am 5am ymlaen ${welshDate}`
    }
    return finalValue
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
