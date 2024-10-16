/* eslint-disable prettier/prettier */
import startNowPage from 'page-objects/startnowpage'
import locationSearchPage from 'page-objects/locationsearchpage'
import ForecastMainPage from 'page-objects/forecastmainpage'
import LocationMatchPage from 'page-objects/locationmatchpage'
import config from 'helpers/config'
import cookieBanner from 'page-objects/cookieBanner'
import { browser, expect } from '@wdio/globals'
import fs from 'node:fs'
import createLogger from 'helpers/logger'
import { XMLParser } from 'fast-xml-parser'
import proxyFetch from 'helpers/proxy-fetch'
const optionsJson = { method: 'GET', headers: { 'Content-Type': 'text/json' } }
const options = { method: 'GET', headers: { 'Content-Type': 'text/xml' } }
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
  return getDailySummary.today
}

function parseForecast(item, place) {
  const name = item.title
  const forecasts = item.description.split('<br />')[2]
  const days = forecasts.match(/\w{3}/g)
  const values = forecasts.match(/\d+/g)
  if (!days || !values || days.length !== values.length) {
    throw new Error(`Failed to parse readings: ${forecasts}`)
  }
  const forecast = days.map((day, i) => ({
    day,
    value: parseInt(values[i], 10)
  }))
  if (name.toUpperCase() === place.toUpperCase()) {
    return forecast
  } else {
    return null
  }
}

async function fetchForecast(place) {
  const forecastUrl = config.get('forecastUrl')
  logger.info(`forecastSummaryUrl: ${forecastUrl}`)
  const response = await proxyFetch(forecastUrl, options).catch((err) => {
    logger.info(`err ${JSON.stringify(err.message)}`)
  })

  let rssForecastXMLResponse
  if (response.ok) {
    rssForecastXMLResponse = await response
  }
  const parser = new XMLParser()
  const body = parser.parse(await rssForecastXMLResponse.text())
  // TODO: handle xml parser failures & http response codes
  return body.rss.channel.item
    .map((i) => {
      try {
        return parseForecast(i, place)
      } catch (error) {
        logger.error(`Error Validation: ${error}`)
        return null
      }
    })
    .filter((i) => i !== null)
}

async function createSets(array, setSize) {
  const sets = []
  for (let i = 0; i < array.length; i += setSize) {
    sets.push(array.slice(i, i + setSize))
  }
  return sets
}

async function fetchMeasurements(nearestplace) {
  const newpollutants = []
  const measurementsApiUrl = config.get('measurementsApiUrl')
  logger.info(`measurementsApiUrl: ${measurementsApiUrl}`)
  const response = await fetch(`${measurementsApiUrl}`, optionsJson).catch(
    (err) => {
      logger.info(`err ${JSON.stringify(err.message)}`)
    }
  )
  let getPollutantResponse
  if (response.ok) {
    getPollutantResponse = await response.json()
  }
  const getMeasurementsArr = getPollutantResponse.measurements
  // eslint-disable-next-line array-callback-return
  getMeasurementsArr.filter((item) => {
    const areaName = item.name
    if (areaName === nearestplace) {
      Object.keys(item.pollutants).forEach((pollutant) => {
        const polValue = item.pollutants[pollutant].value
        if (polValue !== null && polValue !== -99 && polValue !== '0') {
          Object.assign(newpollutants, {
            [pollutant]: {
              value: polValue
            }
          })
        }
      })
    }
  })
  return newpollutants
}

async function getValueOfPol(pollutantValue, polName) {
  for (const key in pollutantValue) {
    if (polName === key) {
      return pollutantValue[key].value
    }
  }
}

async function pollutantsValueCheck(rowsOfPollutants, pollutantValue) {
  const getpollutantNameTrimmed = rowsOfPollutants[0].split('Low')
  const getpollutantValueTrimmed = rowsOfPollutants[1].split('μ')

  if (getpollutantNameTrimmed[0].trim() === 'Ozone') {
    const polValueCheck = Number(getpollutantValueTrimmed[0].trim())
    // evaluate value
    const apiValue = await getValueOfPol(pollutantValue, 'Ozone')
    await expect(polValueCheck.toString()).toMatch(apiValue.toString())

    if (polValueCheck <= 100) {
      await expect(rowsOfPollutants[2]).toMatch('Low')
    }
    if (polValueCheck > 100 && polValueCheck <= 160) {
      await expect(rowsOfPollutants[2]).toMatch('Moderate')
    }
    if (polValueCheck > 160 && polValueCheck <= 240) {
      await expect(rowsOfPollutants[2]).toMatch('High')
    }
    if (polValueCheck > 240) {
      await expect(rowsOfPollutants[2]).toMatch('Very high')
    }
  }
  if (getpollutantNameTrimmed[0].trim() === 'PM2.5') {
    const polValueCheck = Number(getpollutantValueTrimmed[0].trim())
    // evaluate value
    const apiValue = await getValueOfPol(pollutantValue, 'PM2.5')
    await expect(polValueCheck.toString()).toMatch(apiValue.toString())

    if (polValueCheck <= 36) {
      await expect(rowsOfPollutants[2]).toMatch('Low')
    }
    if (polValueCheck > 36 && polValueCheck <= 53) {
      await expect(rowsOfPollutants[2]).toMatch('Moderate')
    }
    if (polValueCheck > 53 && polValueCheck <= 70) {
      await expect(rowsOfPollutants[2]).toMatch('High')
    }
    if (polValueCheck > 70) {
      await expect(rowsOfPollutants[2]).toMatch('Very high')
    }
  }
  if (getpollutantNameTrimmed[0].trim() === 'PM10') {
    const polValueCheck = Number(getpollutantValueTrimmed[0].trim())
    // evaluate value
    const apiValue = await getValueOfPol(pollutantValue, 'PM10')
    await expect(polValueCheck.toString()).toMatch(apiValue.toString())

    if (polValueCheck <= 50) {
      await expect(rowsOfPollutants[2]).toMatch('Low')
    }
    if (polValueCheck > 50 && polValueCheck <= 75) {
      await expect(rowsOfPollutants[2]).toMatch('Moderate')
    }
    if (polValueCheck > 75 && polValueCheck <= 100) {
      await expect(rowsOfPollutants[2]).toMatch('High')
    }
    if (polValueCheck > 100) {
      await expect(rowsOfPollutants[2]).toMatch('Very high')
    }
  }
  if (getpollutantNameTrimmed[0].trim() === 'Nitrogen dioxide') {
    const polValueCheck = Number(getpollutantValueTrimmed[0].trim())
    // evaluate value
    const apiValue = await getValueOfPol(pollutantValue, 'Nitrogen dioxide')
    await expect(polValueCheck.toString()).toMatch(apiValue.toString())

    if (polValueCheck <= 200) {
      await expect(rowsOfPollutants[2]).toMatch('Low')
    }
    if (polValueCheck > 200 && polValueCheck <= 400) {
      await expect(rowsOfPollutants[2]).toMatch('Moderate')
    }
    if (polValueCheck > 400 && polValueCheck <= 600) {
      await expect(rowsOfPollutants[2]).toMatch('High')
    }
    if (polValueCheck > 600) {
      await expect(rowsOfPollutants[2]).toMatch('Very high')
    }
  }
  if (getpollutantNameTrimmed[0].trim() === 'Sulphur dioxide') {
    const polValueCheck = getpollutantValueTrimmed[0].trim()
    // evaluate value
    const apiValue = await getValueOfPol(pollutantValue, 'Sulphur dioxide')
    await expect(polValueCheck.toString()).toMatch(apiValue.toString())

    if (polValueCheck <= 266) {
      await expect(rowsOfPollutants[2]).toMatch('Low')
    }
    if (polValueCheck > 266 && polValueCheck <= 710) {
      await expect(rowsOfPollutants[2]).toMatch('Moderate')
    }
    if (polValueCheck > 710 && polValueCheck <= 1064) {
      await expect(rowsOfPollutants[2]).toMatch('High')
    }
    if (polValueCheck > 1064) {
      await expect(rowsOfPollutants[2]).toMatch('Very high')
    }
  }
}

function renameKeys(obj, newKeys) {
  const keyValues = Object.keys(obj).map((key) => {
    const newKey = newKeys[key] || key
    return { [newKey]: obj[key] }
  })
  return Object.assign({}, ...keyValues)
}
dynlocationValue.forEach(
  ({
    region,
    nearestRegionForecast,
    nearestRegionPollutantsSta1,
    nearestRegionPollutantsSta2,
    nearestRegionPollutantsSta3,
    NI
  }) => {
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
        const getDaqiValue = await ForecastMainPage.daqiForecastValue.getText()
        // Give the nearest match value here - take from front end code
        const getValueForecast = await fetchForecast(nearestRegionForecast)
        const getValueForecastarr = getValueForecast[0]
        // const getDaqiValueStr = getDaqiValue.toString()
        await expect(getDaqiValue).toMatch(
          getValueForecastarr[0].value.toString()
        )
        if (getDaqiValue <= 3) {
          const captionInPage = 'The air pollution forecast for today is low'
          const captionReceived =
            await ForecastMainPage.daqiForecastCaption.getText()
          const hiddenCaptionDaqi =
            await ForecastMainPage.daqiHiddenForecastCaption.getText()
          const hiddenScaleCaptionDaqi =
            await ForecastMainPage.daqiHiddenScaleForecastCaption.getText()
          const captionReceivedWithoutHidden = captionReceived.replace(
            hiddenCaptionDaqi,
            ''
          )
          const captionReceivedWithoutHiddenScale =
            captionReceivedWithoutHidden.replace(hiddenScaleCaptionDaqi, '')
          const extractDAQIIndex = captionReceivedWithoutHiddenScale.replace(
            /\n/g,
            ''
          )
          const extractDAQIIndexFinal = extractDAQIIndex.replace('is', 'is ')
          await expect(extractDAQIIndexFinal).toMatch(captionInPage)
          const caption2InPage = 'Health advice for low levels of air pollution'
          const caption2Received =
            await ForecastMainPage.daqiForecastHeader.getText()
          await expect(caption2Received).toMatch(caption2InPage)
          const healthParaFirstLine = 'Enjoy your usual outdoor activities.'
          try {
            await ForecastMainPage.daqiForecastPara.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'start'
            })
          } catch (error) {
            logger.info('ERRORINSCROLLINTOVIEW')
            logger.error(error)
          }
          const paraArrayList = []
          for (
            let z = 0;
            z < (await ForecastMainPage.forecastMainPagePara.length);
            z++
          ) {
            const paraValue =
              await ForecastMainPage.forecastMainPagePara[z].getText()
            if (paraValue !== '') {
              paraArrayList.push(paraValue)
            }
          }
          await expect(paraArrayList[1]).toMatch(healthParaFirstLine)
        } else if (getDaqiValue > 3 && getDaqiValue < 7) {
          const captionInPage =
            'The air pollution forecast for today is moderate'
          const captionReceived =
            await ForecastMainPage.daqiForecastCaption.getText()
          await expect(captionReceived).toMatch(captionInPage)
          const caption2InPage =
            'Health advice for moderate levels of air pollution'
          const caption2Received =
            await ForecastMainPage.daqiForecastHeader.getText()
          await expect(caption2Received).toMatch(caption2InPage)
          const healthParaFirstLine =
            'For most people, short term exposure to moderate levels of air pollution is not an issue.'
          const paraArrayList = []
          for (
            let z = 0;
            z < (await ForecastMainPage.forecastMainPagePara.length);
            z++
          ) {
            const paraValue =
              await ForecastMainPage.forecastMainPagePara[z].getText()
            if (paraValue !== '') {
              paraArrayList.push(paraValue)
            }
          }
          await expect(paraArrayList[1]).toMatch(healthParaFirstLine)
        } else if (getDaqiValue >= 7 && getDaqiValue < 10) {
          const captionInPage = 'The air pollution forecast for today is high'
          const captionReceived =
            await ForecastMainPage.daqiForecastCaption.getText()
          await expect(captionReceived).toMatch(captionInPage)
          const caption2InPage =
            'Health advice for high levels of air pollution'
          const caption2Received =
            await ForecastMainPage.daqiForecastHeader.getText()
          await expect(caption2Received).toMatch(caption2InPage)
          const healthParaFirstLine =
            'Anyone experiencing discomfort such as sore eyes, cough or sore throat should consider reducing activity, particularly outdoors.'
          const paraArrayList = []
          for (
            let z = 0;
            z < (await ForecastMainPage.forecastMainPagePara.length);
            z++
          ) {
            const paraValue =
              await ForecastMainPage.forecastMainPagePara[z].getText()
            if (paraValue !== '') {
              paraArrayList.push(paraValue)
            }
          }
          await expect(paraArrayList[1]).toMatch(healthParaFirstLine)
        } else if (getDaqiValue === '10') {
          const captionInPage =
            'The air pollution forecast for today is very high'
          const captionReceived =
            await ForecastMainPage.daqiForecastCaption.getText()
          await expect(captionReceived).toMatch(captionInPage)
          const caption2InPage =
            'Health advice for very high levels of air pollution'
          const caption2Received =
            await ForecastMainPage.daqiForecastHeader.getText()
          await expect(caption2Received).toMatch(caption2InPage)
          const healthParaFirstLine =
            'Reduce physical exertion, particularly outdoors, especially if you experience symptoms such as cough or sore throat.'
          const paraArrayList = []
          for (
            let z = 0;
            z < (await ForecastMainPage.forecastMainPagePara.length);
            z++
          ) {
            const paraValue =
              await ForecastMainPage.forecastMainPagePara[z].getText()
            if (paraValue !== '') {
              paraArrayList.push(paraValue)
            }
          }
          await expect(paraArrayList[1]).toMatch(healthParaFirstLine)
        }
        // Accordian text check
        // await browser.scroll(0, 500)
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
        const accordianHeading = 'Index'
        const accordianHeadingReceived =
          await ForecastMainPage.daqiAccordianHeaderIndex.getText()
        await expect(accordianHeadingReceived).toMatch(accordianHeading)
        await ForecastMainPage.daqiAccordian.click()
        // Pollutant Summary checks
        const sourcePollutantSummaryUrl = await pollutantSummaryUrl()
        const pollutantSummaryFromPage =
          await ForecastMainPage.pollutantSummary.getText()
        await expect(pollutantSummaryFromPage.trim()).toMatch(
          sourcePollutantSummaryUrl.trim()
        )

        try {
          await ForecastMainPage.pollutantsNameTableLinks.scrollIntoView()
        } catch (error) {
          logger.info('ERRORINSCROLLINTOVIEW')
          logger.error(error)
        }
        // await browser.scroll(0, 1500)

        const getPollutantStationStr =
          await ForecastMainPage.stationFirstName.getText()

        // get dynamic pollutant value
        if (getPollutantStationStr === nearestRegionPollutantsSta1) {
          const pollutantValues = await fetchMeasurements(
            nearestRegionPollutantsSta1
          )
          const newKeys = {
            NO2: 'Nitrogen dioxide',
            SO2: 'Sulphur dioxide',
            GE10: 'PM10',
            PM25: 'PM2.5',
            O3: 'Ozone'
          }
          const renamedDynPollutantValues = renameKeys(pollutantValues, newKeys)
          // get pollutant UI table values
          const getTableValues =
            await ForecastMainPage.pollutantsFirstTableCollections()
          const setsOfThree = await createSets(getTableValues, 3)
          for (let j = 0; j < setsOfThree.length; j++) {
            await pollutantsValueCheck(
              setsOfThree[j],
              renamedDynPollutantValues
            )
          }
        } else if (getPollutantStationStr === nearestRegionPollutantsSta2) {
          const pollutantValues = await fetchMeasurements(
            nearestRegionPollutantsSta2
          )
          const newKeys = {
            NO2: 'Nitrogen dioxide',
            SO2: 'Sulphur dioxide',
            GE10: 'PM10',
            PM25: 'PM2.5',
            O3: 'Ozone'
          }
          const renamedDynPollutantValues = renameKeys(pollutantValues, newKeys)
          // get pollutant UI table values
          const getTableValues =
            await ForecastMainPage.pollutantsFirstTableCollections()
          const setsOfThree = await createSets(getTableValues, 3)
          for (let j = 0; j < setsOfThree.length; j++) {
            await pollutantsValueCheck(
              setsOfThree[j],
              renamedDynPollutantValues
            )
          }
        } else if (getPollutantStationStr === nearestRegionPollutantsSta3) {
          const pollutantValues = await fetchMeasurements(
            nearestRegionPollutantsSta3
          )
          const newKeys = {
            NO2: 'Nitrogen dioxide',
            SO2: 'Sulphur dioxide',
            GE10: 'PM10',
            PM25: 'PM2.5',
            O3: 'Ozone'
          }
          const renamedDynPollutantValues = renameKeys(pollutantValues, newKeys)
          // get pollutant UI table values
          const getTableValues =
            await ForecastMainPage.pollutantsFirstTableCollections()
          const setsOfThree = await createSets(getTableValues, 3)
          for (let j = 0; j < setsOfThree.length; j++) {
            await pollutantsValueCheck(
              setsOfThree[j],
              renamedDynPollutantValues
            )
          }
        }
        await browser.deleteCookies(['airaqie_cookie'])
        logger.info('--- FMP EndScenario daqi value-direct search --------')
      })
    })
  }
)
