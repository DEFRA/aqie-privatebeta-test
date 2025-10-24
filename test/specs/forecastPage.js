import startNowPage from '../page-objects/startnowpage.js'
import locationSearchPage from '../page-objects/locationsearchpage.js'
import ForecastMainPage from '../page-objects/forecastmainpage.js'
import LocationMatchPage from '../page-objects/locationmatchpage.js'
import config from '../helpers/config.js'
import cookieBanner from '../page-objects/cookieBanner.js'
import { browser, expect } from '@wdio/globals'
import fs from 'node:fs'
import createLogger from '../helpers/logger.js'
import proxyFetch from '../helpers/proxy-fetch.js'

const optionsJson = { method: 'GET', headers: { 'Content-Type': 'text/json' } }
const dynlocationValue = JSON.parse(
  fs.readFileSync('test/testdata/dynamicForecast.json')
)
const logger = createLogger()

// Fetch pollutant summary data from API
async function pollutantSummaryUrl() {
  const forecastSummaryUrl = config.get('forecastSummaryUrl')
  logger.info(`forecastSummaryUrl: ${forecastSummaryUrl}`)

  const response = await proxyFetch(forecastSummaryUrl, optionsJson).catch(
    (err) => {
      logger.info(`err ${JSON.stringify(err.message)}`)
    }
  )

  let responseData
  if (response && response.ok) {
    responseData = await response.json()
  }
  return responseData
}

// Get next 4 days as array of 3-letter abbreviations
function getNext4Days() {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ]
  const today = new Date()
  const todayIndex = today.getDay()
  const next4Days = []

  // Get tomorrow to 5 days from today (4 days total)
  for (let i = 1; i <= 4; i++) {
    const futureIndex = (todayIndex + i) % days.length
    const dayName = days[futureIndex]
    // Get first 3 letters with first letter capitalized
    next4Days.push(dayName.slice(0, 3))
  }

  return next4Days
}

// Extract forecast-summary from API response
async function getDailySummary() {
  const responseData = await pollutantSummaryUrl()
  if (responseData && responseData['forecast-summary']) {
    return responseData['forecast-summary']
  }
  return null
}

// Fetch forecast data for specific location
async function fetchForecast(place) {
  const forecastUrl = config.get('forecastUrl')
  logger.info(`forecastSummaryUrl: ${forecastUrl}`)

  const response = await proxyFetch(forecastUrl, optionsJson).catch((err) => {
    logger.info(`err ${JSON.stringify(err.message)}`)
    return null
  })

  if (!response || !response.ok) {
    logger.error('Failed to fetch forecast data')
    return null
  }

  const metOfficeForecastJsonResponse = await response.json()
  const metOfficeJsonData = metOfficeForecastJsonResponse.forecasts

  const matchedForecast = metOfficeJsonData.find((item) => {
    return item.name.toUpperCase() === place.toUpperCase()
  })

  return matchedForecast || null
}

dynlocationValue.forEach(({ region, nearestRegionForecast, NI }) => {
  describe(`Forecast Main Page - ${region}`, () => {
    it('daqi value-direct search', async () => {
      logger.info('--- FMP StartScenario daqi value-direct search --------')

      // Initialize browser and handle cookies
      await browser.deleteCookies(['airaqie_cookie'])
      await browser.url('')
      await browser.maximizeWindow()

      // Handle the cookie banner
      if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
        await cookieBanner.rejectButtonCookiesDialog.click()
        await cookieBanner.hideButtonHideDialog.click()
      }

      // Navigate to forecast page
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

      // Get DAQI values and forecast data
      const getDaqiValue = await ForecastMainPage.daqiForecastValue()
      const getValueForecast = await fetchForecast(nearestRegionForecast)
      const getValueForecastarr = getValueForecast.forecast

      await expect(getDaqiValue).toMatch(
        getValueForecastarr[0].value.toString()
      )

      // Test Today tab
      const todayDAQITab = await ForecastMainPage.todayDAQITab
      const isSelected =
        (await todayDAQITab.getAttribute('aria-selected')) === 'true'
      const tabText = await todayDAQITab.getText()

      if (isSelected && tabText.trim() === 'Today') {
        const getHeaderOfDaqi = await ForecastMainPage.headerOfDAQITab.getText()
        await expect(getHeaderOfDaqi).toMatch('Daily Air Quality Index (DAQI)')
        await expect(getDaqiValue).toMatch(
          getValueForecastarr[0].value.toString()
        )

        const getTodayForecastSummary =
          await ForecastMainPage.todayPollutantSummary.getText()
        const sourcePollutantSummaryUrl = await getDailySummary()
        const sourcePollutantSummaryURlToday =
          sourcePollutantSummaryUrl?.today || ''
        await expect(getTodayForecastSummary.trim()).toMatch(
          sourcePollutantSummaryURlToday.trim()
        )
      } else {
        throw new Error(
          "The 'Today' tab is either not selected or the text does not match 'Today'"
        )
      }

      // Test Tomorrow tab
      const tomorrowDAQITab = await ForecastMainPage.tomorrowDAQITab
      const isNotSelectedTomorrow =
        (await tomorrowDAQITab.getAttribute('aria-selected')) === 'false'
      const tabTextTomorrow = await tomorrowDAQITab.getText()
      const arrayOfNext4Days = getNext4Days()

      if (
        isNotSelectedTomorrow &&
        tabTextTomorrow.trim() === arrayOfNext4Days[0].toString()
      ) {
        await tomorrowDAQITab.click()
        const getHeaderOfDaqiTomorrow =
          await ForecastMainPage.headerOfDAQITabSecondDay()
        await expect(getHeaderOfDaqiTomorrow).toMatch(
          'Daily Air Quality Index (DAQI)'
        )
        await expect(getDaqiValue).toMatch(
          getValueForecastarr[1].value.toString()
        )

        const getTomorrowForecastSummary =
          await ForecastMainPage.tomorowDAQIPollutantSummary.getText()
        const sourcePollutantSummaryUrl = await getDailySummary()
        const sourcePollutantSummaryURlTomorrow =
          sourcePollutantSummaryUrl?.tomorrow || ''
        await expect(getTomorrowForecastSummary.trim()).toMatch(
          sourcePollutantSummaryURlTomorrow.trim()
        )
      }

      // Test Day Three tab
      const dayThreeDAQITab = await ForecastMainPage.dayThreeDAQITab
      const isNotSelectedDayThree =
        (await dayThreeDAQITab.getAttribute('aria-selected')) === 'false'
      const tabTextDayThree = await dayThreeDAQITab.getText()

      if (
        isNotSelectedDayThree &&
        tabTextDayThree.trim() === arrayOfNext4Days[1].toString()
      ) {
        await dayThreeDAQITab.click()
        const getHeaderOfDaqiThirdDay =
          await ForecastMainPage.headerOfDAQITabThirdDay()
        await expect(getHeaderOfDaqiThirdDay).toMatch(
          'Daily Air Quality Index (DAQI)'
        )
        await expect(getDaqiValue).toMatch(
          getValueForecastarr[2].value.toString()
        )

        const getDay3ForecastSummary =
          await ForecastMainPage.outlookDay3DAQIPollutantSummary.getText()
        const sourcePollutantSummaryUrl = await getDailySummary()
        const sourcePollutantSummaryURlOutlook =
          sourcePollutantSummaryUrl?.outlook || ''
        await expect(getDay3ForecastSummary.trim()).toMatch(
          sourcePollutantSummaryURlOutlook.trim()
        )
      }

      // Test Day Four tab
      const dayFourDAQITab = await ForecastMainPage.dayFourDAQITab
      const isNotSelectedDayFour =
        (await dayFourDAQITab.getAttribute('aria-selected')) === 'false'
      const tabTextDayFour = await dayFourDAQITab.getText()

      if (
        isNotSelectedDayFour &&
        tabTextDayFour.trim() === arrayOfNext4Days[2].toString()
      ) {
        await dayFourDAQITab.click()
        const getHeaderOfDaqiFourthDay =
          await ForecastMainPage.headerOfDAQITabFourthDay()
        await expect(getHeaderOfDaqiFourthDay).toMatch(
          'Daily Air Quality Index (DAQI)'
        )
        await expect(getDaqiValue).toMatch(
          getValueForecastarr[3].value.toString()
        )

        const getDay4ForecastSummary =
          await ForecastMainPage.outlookDay4DAQIPollutantSummary.getText()
        const sourcePollutantSummaryUrl = await getDailySummary()
        const sourcePollutantSummaryURlOutlook =
          sourcePollutantSummaryUrl?.outlook || ''
        await expect(getDay4ForecastSummary.trim()).toMatch(
          sourcePollutantSummaryURlOutlook.trim()
        )
      }

      // Test Day Five tab
      const dayFiveDAQITab = await ForecastMainPage.dayFiveDAQITab
      const isNotSelectedDayFive =
        (await dayFiveDAQITab.getAttribute('aria-selected')) === 'false'
      const tabTextDayFive = await dayFiveDAQITab.getText()

      if (
        isNotSelectedDayFive &&
        tabTextDayFive.trim() === arrayOfNext4Days[3].toString()
      ) {
        await dayFiveDAQITab.click()
        const getHeaderOfDaqiFifthDay =
          await ForecastMainPage.headerOfDAQITabFiveDay()
        await expect(getHeaderOfDaqiFifthDay).toMatch(
          'Daily Air Quality Index (DAQI)'
        )
        await expect(getDaqiValue).toMatch(
          getValueForecastarr[4].value.toString()
        )

        const getDay5ForecastSummary =
          await ForecastMainPage.outlookDay5DAQIPollutantSummary.getText()
        const sourcePollutantSummaryUrl = await getDailySummary()
        const sourcePollutantSummaryURlOutlook =
          sourcePollutantSummaryUrl?.outlook || ''
        await expect(getDay5ForecastSummary.trim()).toMatch(
          sourcePollutantSummaryURlOutlook.trim()
        )
      }

      // Test accordion functionality
      try {
        await ForecastMainPage.daqiAccordian.scrollIntoView()
      } catch (error) {
        logger.info('Error scrolling to accordion')
        logger.error(error)
      }

      const accordionText =
        'How different levels of air pollution can affect health'
      const accordionTextReceived =
        await ForecastMainPage.daqiAccordian.getText()
      await expect(accordionTextReceived).toMatch(accordionText)
      await ForecastMainPage.daqiAccordian.click()

      const accordionHeading = 'Level'
      const accordionHeadingReceived =
        await ForecastMainPage.daqiAccordianHeaderIndex.getText()
      await expect(accordionHeadingReceived).toMatch(accordionHeading)
      await ForecastMainPage.daqiAccordian.click()

      // Test pollutant tabs if available
      try {
        await ForecastMainPage.pollutantsNameTableLinks.scrollIntoView()
      } catch (error) {
        logger.info('Error scrolling to pollutant links')
        logger.error(error)
      }

      const tabPollutantsNameArrCheck =
        await ForecastMainPage.tabPollutantsNameArrayCheck()
      if (tabPollutantsNameArrCheck) {
        const tabPollutantsNameLength =
          await ForecastMainPage.tabPollutantsAreaNameLength()
        if (tabPollutantsNameLength > 1) {
          const arrPollutants =
            await ForecastMainPage.tabPollutantsAreaNameAll()

          // Test tab functionality
          await tabIterations(arrPollutants)

          // Test Welsh language toggle
          await locationSearchPage.linkButtonWelsh.scrollIntoView()
          await locationSearchPage.linkButtonWelsh.click()
          await ForecastMainPage.pollutantsNameTableLinks.scrollIntoView()
          await tabIterations(arrPollutants)

          // Test English language toggle
          await locationSearchPage.linkButtonEnglish.scrollIntoView()
          await locationSearchPage.linkButtonEnglish.click()
        }
      }

      await browser.deleteCookies(['airaqie_cookie'])
      logger.info('--- FMP EndScenario daqi value-direct search --------')
    })
  })
})

// Helper function for tab iterations
async function tabIterations(arrPollutants) {
  for (let i = 0; i < arrPollutants.length; i++) {
    if (i > 0) {
      await arrPollutants[i].click()
    }
    const tabAreaName = await arrPollutants[i].getText()
    const first14CharsTabs = tabAreaName.slice(0, 14)
    const arrAreaPollutantName = await ForecastMainPage.tabPollutantsAreaName()
    const getTextOfPollutantArea = await arrAreaPollutantName[i].getText()
    const first14CharsInsideTabs = getTextOfPollutantArea.slice(0, 14)
    await expect(first14CharsTabs).toMatch(first14CharsInsideTabs)
  }
}
