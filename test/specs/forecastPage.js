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

// Store the last fetched forecast response globally for getDailySummary to access
let lastForecastResponse = null

// Fetch forecast data for specific location with fallback
async function fetchForecast(place) {
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
      !metOfficeForecastJsonResponse.forecasts
    ) {
      logger.error(
        '[fetchForecast] Invalid response format: missing forecasts data'
      )
      return null
    }

    // Store the full response globally so getDailySummary can access forecast-summary
    const metOfficeJsonData = metOfficeForecastJsonResponse.forecasts

    // Store forecast-summary for later use
    lastForecastResponse = metOfficeForecastJsonResponse

    const matchedForecast = metOfficeJsonData.find((item) => {
      return item.name.toUpperCase() === place.toUpperCase()
    })

    logger.info(
      `[fetchForecast] Match found for ${place}: ${matchedForecast ? 'YES' : 'NO'}`
    )
    logger.info(
      `[fetchForecast] Forecast summary available: ${lastForecastResponse ? 'YES' : 'NO'}`
    )
    return matchedForecast || null
  } catch (err) {
    logger.error(`[fetchForecast] Error parsing response: ${err.message}`)
    return null
  }
}

// Extract forecast-summary from stored forecast response
async function getDailySummary() {
  if (lastForecastResponse) {
    logger.info(
      '[getDailySummary] Using forecast-summary from fetchForecast response'
    )
    return lastForecastResponse['forecast-summary']
  }
  logger.warn('[getDailySummary] No forecast response available')
  return null
}

// Get expected hex color based on DAQI number
function getExpectedDAQIColor(daqiValue) {
  const daqiColorMap = {
    1: '#9CFF9C',
    2: '#31FF00',
    3: '#31CF00',
    4: '#FFFF00',
    5: '#FFCF00',
    6: '#FF9A00',
    7: '#FF6464',
    8: '#FF0000',
    9: '#990000',
    10: '#CE30FF'
  }

  const daqiNumber = parseInt(daqiValue, 10)
  const expectedColor = daqiColorMap[daqiNumber]

  if (!expectedColor) {
    logger.warn(`No color mapping found for DAQI value: ${daqiValue}`)
    return null
  }

  logger.info(
    `Expected color for DAQI ${daqiNumber}: ${expectedColor.toUpperCase()}`
  )
  return expectedColor.toUpperCase()
}

// Get all DAQI selected values from the page and store with labels
async function getAllDAQIValues() {
  const getAllDAQISelectedValues =
    await ForecastMainPage.getAllDAQISelectedValues

  // Iterate through the array and store values with labels
  const arrGetAllDAQISelectedValues = {}
  const daqiLabels = ['today', 'tomorrow', 'outlook1', 'outlook2', 'outlook3']

  for (let i = 0; i < getAllDAQISelectedValues.length; i++) {
    const value = await getAllDAQISelectedValues[i].getText()
    arrGetAllDAQISelectedValues[daqiLabels[i]] = value
    logger.info(`DAQI ${daqiLabels[i]}: ${value}`)

    // Get and validate background color for this DAQI value
    try {
      const backgroundColor =
        await getAllDAQISelectedValues[i].getCSSProperty('background-color')
      const hexColor = rgbToHex(backgroundColor.value)
      const expectedColor = getExpectedDAQIColor(value)

      if (hexColor && expectedColor) {
        logger.info(
          `DAQI ${daqiLabels[i]} - Actual color: ${hexColor}, Expected: ${expectedColor}`
        )
        await expect(hexColor).toMatch(expectedColor)
      } else {
        logger.warn(
          `Unable to validate color for DAQI ${daqiLabels[i]}: hexColor=${hexColor}, expectedColor=${expectedColor}`
        )
      }

      if (hexColor && expectedColor && hexColor !== expectedColor) {
        logger.error(
          `Color mismatch for DAQI ${daqiLabels[i]} (${value}): Expected ${expectedColor}, Got ${hexColor}`
        )
      }
    } catch (error) {
      logger.warn(
        `Error validating color for DAQI ${daqiLabels[i]}: ${error.message}`
      )
      // Rethrow so the test runner fails the test on assertion errors
      throw error
    }
  }

  logger.info(`All DAQI values: ${JSON.stringify(arrGetAllDAQISelectedValues)}`)

  return arrGetAllDAQISelectedValues
}

// Convert RGB color to Hex format
function rgbToHex(rgb) {
  // Handle rgb(r, g, b) or rgba(r, g, b, a) format
  const rgbMatch = rgb.match(/\d+/g)
  if (!rgbMatch || rgbMatch.length < 3) {
    logger.warn(`Unable to parse RGB value: ${rgb}`)
    return null
  }

  const r = parseInt(rgbMatch[0], 10)
  const g = parseInt(rgbMatch[1], 10)
  const b = parseInt(rgbMatch[2], 10)

  const toHex = (num) => {
    const hex = num.toString(16).toUpperCase()
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

dynlocationValue.forEach(({ region, nearestRegionForecast, NI }) => {
  describe(`Forecast Main Page - ${region}`, () => {
    it('daqi value-direct search', async () => {
      logger.info('--- FMP StartScenario daqi value-direct search --------')

      // Initialize browser and handle cookies
      await browser.deleteCookies(['airaqie_cookie'])
      // await browser.url('')
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
      // Get all DAQI values from the page
      const arrGetAllDAQISelectedValues = await getAllDAQIValues()
      const getDaqiValueToday = arrGetAllDAQISelectedValues.today

      // Test Today tab
      const todayDAQITab = await ForecastMainPage.todayDAQITab
      const isSelected =
        (await todayDAQITab.getAttribute('aria-selected')) === 'true'
      const tabText = await todayDAQITab.getText()
      // Get DAQI values and forecast data
      const getValueForecast = await fetchForecast(nearestRegionForecast)
      const getValueForecastarr = getValueForecast.forecast
      //  await browser.url('https://aqie-front-end.test.cdp-int.defra.cloud/location/gloucester_gloucester?mockLevel=9&mockDay=day1#day1')

      if (isSelected && tabText.trim() === 'Today') {
        const getHeaderOfDaqi = await ForecastMainPage.headerOfDAQITab.getText()
        await expect(getHeaderOfDaqi).toMatch('Daily Air Quality Index (DAQI)')

        if (getDaqiValueToday >= 7) {
          const highLevelAlertSymbol =
            await ForecastMainPage.highLevelAlertMessageSymbol.getText()
          await expect(highLevelAlertSymbol).toMatch('!')
        }
        await expect(getDaqiValueToday).toMatch(
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
        // Get all DAQI values from the page
        const arrGetAllDAQISelectedValuesForTom = await getAllDAQIValues()
        const getDaqiValuetomorrow = arrGetAllDAQISelectedValuesForTom.tomorrow
        const getHeaderOfDaqiTomorrow =
          await ForecastMainPage.headerOfDAQITabSecondDay()
        await expect(getHeaderOfDaqiTomorrow).toMatch(
          'Daily Air Quality Index (DAQI)'
        )
        await expect(getDaqiValuetomorrow).toMatch(
          getValueForecastarr[1].value.toString()
        )
        if (getDaqiValueToday >= 7) {
          const highLevelAlertSymbol =
            await ForecastMainPage.highLevelAlertMessageSymbol.getText()
          await expect(highLevelAlertSymbol).toMatch('!')
        }

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
        // Get all DAQI values from the page
        const arrGetAllDAQISelectedValuesForOut1 = await getAllDAQIValues()
        const getDaqiValueOutlook1 = arrGetAllDAQISelectedValuesForOut1.outlook1

        const getHeaderOfDaqiThirdDay =
          await ForecastMainPage.headerOfDAQITabThirdDay()
        await expect(getHeaderOfDaqiThirdDay).toMatch(
          'Daily Air Quality Index (DAQI)'
        )
        await expect(getDaqiValueOutlook1).toMatch(
          getValueForecastarr[2].value.toString()
        )
        if (getDaqiValueToday >= 7) {
          const highLevelAlertSymbol =
            await ForecastMainPage.highLevelAlertMessageSymbol.getText()
          await expect(highLevelAlertSymbol).toMatch('!')
        }

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
        // Get all DAQI values from the page
        const arrGetAllDAQISelectedValuesForOut2 = await getAllDAQIValues()
        const getDaqiValueOutlook2 = arrGetAllDAQISelectedValuesForOut2.outlook2
        const getHeaderOfDaqiFourthDay =
          await ForecastMainPage.headerOfDAQITabFourthDay()
        await expect(getHeaderOfDaqiFourthDay).toMatch(
          'Daily Air Quality Index (DAQI)'
        )
        await expect(getDaqiValueOutlook2).toMatch(
          getValueForecastarr[3].value.toString()
        )
        if (getDaqiValueToday >= 7) {
          const highLevelAlertSymbol =
            await ForecastMainPage.highLevelAlertMessageSymbol.getText()
          await expect(highLevelAlertSymbol).toMatch('!')
        }

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
        // Get all DAQI values from the page
        const arrGetAllDAQISelectedValuesForOut3 = await getAllDAQIValues()
        const getDaqiValueOutlook3 = arrGetAllDAQISelectedValuesForOut3.outlook3
        const getHeaderOfDaqiFifthDay =
          await ForecastMainPage.headerOfDAQITabFiveDay()
        await expect(getHeaderOfDaqiFifthDay).toMatch(
          'Daily Air Quality Index (DAQI)'
        )
        await expect(getDaqiValueOutlook3).toMatch(
          getValueForecastarr[4].value.toString()
        )
        if (getDaqiValueToday >= 7) {
          const highLevelAlertSymbol =
            await ForecastMainPage.highLevelAlertMessageSymbol.getText()
          await expect(highLevelAlertSymbol).toMatch('!')
        }

        const getDay5ForecastSummary =
          await ForecastMainPage.outlookDay5DAQIPollutantSummary.getText()
        const sourcePollutantSummaryUrl = await getDailySummary()
        const sourcePollutantSummaryURlOutlook =
          sourcePollutantSummaryUrl?.outlook || ''
        await expect(getDay5ForecastSummary.trim()).toMatch(
          sourcePollutantSummaryURlOutlook.trim()
        )
      }

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
