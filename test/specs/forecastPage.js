/* eslint-disable prettier/prettier */
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
async function pollutantSummaryUrl() {
  const forecastSummaryUrl = config.get('forecastSummaryUrl')
  logger.info(`forecastSummaryUrl: ${forecastSummaryUrl}`)
  const response = await proxyFetch(forecastSummaryUrl, optionsJson).catch(
    (err) => {
      logger.info(`err ${JSON.stringify(err.message)}`)
    }
  )

  let getDailySummary
  if (response.ok) {
    getDailySummary = await response.json()
  }
  // const getTodayForecastMessage = getDailySummary
  return getDailySummary
}

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

async function daqiScaleLookup(getRssFeedDayValue) {
  if (getRssFeedDayValue <= 3) {
    getRssFeedDayValue = 'Low'
  } else if (getRssFeedDayValue >= 4 && getRssFeedDayValue <= 6) {
    getRssFeedDayValue = 'Moderate'
  } else if (getRssFeedDayValue >= 7 && getRssFeedDayValue <= 9) {
    getRssFeedDayValue = 'High'
  } else if (getRssFeedDayValue === 10) {
    getRssFeedDayValue = 'Very High'
  }
  return getRssFeedDayValue
}

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

function getFutureDay(currentDay, daysToAdd) {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ]
  const currentIndex = days.indexOf(currentDay)
  const futureIndex = (currentIndex + daysToAdd) % days.length
  return days[futureIndex]
}

dynlocationValue.forEach(({ region, nearestRegionForecast, NI }) => {
  describe('Forecast Main Page', () => {
    it('daqi value-direct search', async () => {
      logger.info('--- FMP StartScenario daqi value-direct search --------')
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
      // DAQI Value check
      /* const getTableValues =
          await ForecastMainPage.pollutantsFirstTableCollections() */
      const getDaqiValue = await ForecastMainPage.daqiForecastValue()

      // Give the nearest match value here - take from front end code
      const getValueForecast = await fetchForecast(nearestRegionForecast)
      const getValueForecastarr = getValueForecast.forecast

      // const getValueForecastarr = firstForecast
      // const getDaqiValueStr = getDaqiValue.toString()
      await expect(getDaqiValue).toMatch(
        getValueForecastarr[0].value.toString()
      )
      const captionNext4DaysHeader =
        await ForecastMainPage.daqiOf4DaysHeader.getText()
      await expect(captionNext4DaysHeader).toMatch(
        'The forecast for the next 4 days'
      )

      // const getValueNext4DaysForecastarr = getValueForecast[0]
      const date = new Date()
      date.setDate(date.getDate() + 1)
      const currentDayPlus1 = date.toLocaleString('en-US', {
        weekday: 'long'
      })
      const dayPlusOne = currentDayPlus1.slice(0, 3)
      const getRssFeedDayPlusOneName = getValueForecastarr[1].day.toString()
      const getRssFeedDayPlusOneValue = getValueForecastarr[1].value.toString()
      const getAppDayPlusOneName =
        await ForecastMainPage.dayPlusOneName.getText()
      const getAppDayPlusOneValue =
        await ForecastMainPage.dayPlusOneValue.getText()

      if (dayPlusOne === getRssFeedDayPlusOneName) {
        const getRssFeedDay = await daqiScaleLookup(getRssFeedDayPlusOneValue)
        await expect(getRssFeedDay).toMatch(getAppDayPlusOneValue)
        await expect(getRssFeedDayPlusOneName).toMatch(getAppDayPlusOneName)
      }

      date.setDate(date.getDate() + 2)
      const currentDayPlus2 = date.toLocaleString('en-US', {
        weekday: 'long'
      })
      const dayPlusTwo = currentDayPlus2.slice(0, 3)
      const getRssFeedDayPlusTwoName = getValueForecastarr[2].day.toString()
      const getRssFeedDayPlusTwoValue = getValueForecastarr[2].value.toString()
      const getAppDayPlusTwoName =
        await ForecastMainPage.dayPlusTwoName.getText()
      const getAppDayPlusTwoValue =
        await ForecastMainPage.dayPlusTwoValue.getText()

      if (dayPlusTwo === getRssFeedDayPlusTwoName) {
        const getRssFeedDay = await daqiScaleLookup(getRssFeedDayPlusTwoValue)
        await expect(getRssFeedDay).toMatch(getAppDayPlusTwoValue)
        await expect(getRssFeedDayPlusTwoName).toMatch(getAppDayPlusTwoName)
      }

      date.setDate(date.getDate() + 3)
      const currentDayPlus3 = date.toLocaleString('en-US', {
        weekday: 'long'
      })
      const dayPlusThree = currentDayPlus3.slice(0, 3)
      const getRssFeedDayPlusThreeName = getValueForecastarr[3].day.toString()
      const getRssFeedDayPlusThreeValue =
        getValueForecastarr[3].value.toString()
      const getAppDayPlusThreeName =
        await ForecastMainPage.dayPlusThreeName.getText()
      const getAppDayPlusThreeValue =
        await ForecastMainPage.dayPlusThreeValue.getText()

      if (dayPlusThree === getRssFeedDayPlusThreeName) {
        const getRssFeedDay = await daqiScaleLookup(getRssFeedDayPlusThreeValue)
        await expect(getRssFeedDay).toMatch(getAppDayPlusThreeValue)
        await expect(getRssFeedDayPlusThreeName).toMatch(getAppDayPlusThreeName)
      }

      date.setDate(date.getDate() + 4)
      const currentDayPlus4 = date.toLocaleString('en-US', {
        weekday: 'long'
      })
      const dayPlusFour = currentDayPlus4.slice(0, 3)
      const getRssFeedDayPlusFourName = getValueForecastarr[4].day.toString()
      const getRssFeedDayPlusFourValue = getValueForecastarr[4].value.toString()
      const getAppDayPlusFourName =
        await ForecastMainPage.dayPlusFourName.getText()
      const getAppDayPlusFourValue =
        await ForecastMainPage.dayPlusFourValue.getText()

      if (dayPlusFour === getRssFeedDayPlusFourName) {
        const getRssFeedDay = await daqiScaleLookup(getRssFeedDayPlusFourValue)
        await expect(getRssFeedDay).toMatch(getAppDayPlusFourValue)
        await expect(getRssFeedDayPlusFourName).toMatch(getAppDayPlusFourName)
      }
      await ForecastMainPage.pollutantsUKSummaryLinks.scrollIntoView()

      // UK Forecast

      const sourcePollutantSummaryUrl = await pollutantSummaryUrl()
      const sourcePollutantSummaryURlToday =
        await sourcePollutantSummaryUrl.today
      const sourcePollutantSummaryURlTomorrow =
        await sourcePollutantSummaryUrl.tomorrow
      const sourcePollutantSummaryURlOutlook =
        await sourcePollutantSummaryUrl.outlook

      const todayPollutantSummaryTitle =
        await ForecastMainPage.todayPollutantSummaryTitle.getText()
      const tomorrowPollutantSummaryTitle =
        await ForecastMainPage.tomorrowPollutantSummaryTitle.getText()
      const outlookPollutantSummaryTitle =
        await ForecastMainPage.outlookPollutantSummaryTitle.getText()
      await expect(todayPollutantSummaryTitle).toMatch('Today')
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
      const todayGetDay = days[today.getDay()]
      const tomorowDayName = getFutureDay(todayGetDay, 1)
      await expect(tomorrowPollutantSummaryTitle).toMatch(tomorowDayName)
      const outlookDayNameRange1 = getFutureDay(todayGetDay, 2)
      const outlookDayNameRange2 = getFutureDay(todayGetDay, 6)
      await expect(outlookPollutantSummaryTitle).toMatch(
        `${outlookDayNameRange1} to ${outlookDayNameRange2}`
      )
      const ukForecastTodayPara =
        await ForecastMainPage.todayPollutantSummary.getText()
      await expect(ukForecastTodayPara.trim()).toMatch(
        sourcePollutantSummaryURlToday.trim()
      )

      // Tomorrow Forecast
      const ukForecastTomorrowPara =
        await ForecastMainPage.tomorowPollutantSummary.getText()
      await expect(ukForecastTomorrowPara.trim()).toMatch(
        sourcePollutantSummaryURlTomorrow.trim()
      )

      // Outlook Forecast
      const ukForecastOutlookPara =
        await ForecastMainPage.outlookPollutantSummary.getText()
      await expect(ukForecastOutlookPara.trim()).toMatch(
        sourcePollutantSummaryURlOutlook.trim()
      )

      try {
        await ForecastMainPage.daqiAccordian.scrollIntoView()
      } catch (error) {
        logger.info('ERRORINSCROLLINTOVIEW')
        logger.error(error)
      }
      const accordianText =
        'How different levels of air pollution can affect health'
      const accordianTextReceived =
        await ForecastMainPage.daqiAccordian.getText()
      await expect(accordianTextReceived).toMatch(accordianText)
      await ForecastMainPage.daqiAccordian.click()
      const accordianHeading = 'Level'
      const accordianHeadingReceived =
        await ForecastMainPage.daqiAccordianHeaderIndex.getText()
      await expect(accordianHeadingReceived).toMatch(accordianHeading)
      await ForecastMainPage.daqiAccordian.click()

      try {
        await ForecastMainPage.pollutantsNameTableLinks.scrollIntoView()
      } catch (error) {
        logger.info('ERRORINSCROLLINTOVIEW')
        logger.error(error)
      }
      // await browser.scroll(0, 1500)
      // Evaluate the tab redesign tabPollutantsNameLength

      const tabPollutantsNameArrCheck =
        await ForecastMainPage.tabPollutantsNameArrayCheck()
      if (tabPollutantsNameArrCheck) {
        const tabPollutantsNameLength =
          await ForecastMainPage.tabPollutantsAreaNameLength()
        if (tabPollutantsNameLength > 1) {
          const arrPollutants =
            await ForecastMainPage.tabPollutantsAreaNameAll()
          // tab redesign iterations
          await tabIterations(arrPollutants)
          // Click Welsh Toogle button
          await locationSearchPage.linkButtonWelsh.scrollIntoView()
          await locationSearchPage.linkButtonWelsh.click()
          await ForecastMainPage.pollutantsNameTableLinks.scrollIntoView()
          await tabIterations(arrPollutants)
          // Click English Toogle button
          await locationSearchPage.linkButtonEnglish.scrollIntoView()
          await locationSearchPage.linkButtonEnglish.click()
        }
      }
      await browser.deleteCookies(['airaqie_cookie'])
      logger.info('--- FMP EndScenario daqi value-direct search --------')
    })
  })
})
