import startNowPage from '../page-objects/startnowpage.js'
import locationSearchPage from '../page-objects/locationsearchpage.js'
import LocationMatchPage from '../page-objects/locationmatchpage.js'
import cookieBanner from '../page-objects/cookieBanner.js'
import ForecastMainPage from '../page-objects/forecastmainpage.js'
import proxyFetch from '../helpers/proxy-fetch.js'
import createLogger from '../helpers/logger.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import config from '../helpers/config.js'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const logger = createLogger()

const LOGIN_URL = config.get('siteMetaDataLoginUrl')
const EMAIL = config.get('newRicardoApiEmail')
const PASSWORD = config.get('newRicardoApiPwd')

async function getBearerToken() {
  logger.info('Requesting bearer token...')
  const response = await proxyFetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD
    })
  })
  let data
  if (response.ok) {
    data = await response.json()
  }
  logger.info('Login response data:', JSON.stringify(data))
  logger.info('Extracted token:', JSON.stringify(data.token)) // Output token received
  return data.token // Adjust if token key is different
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

async function fetchSiteMetaDatas(token, latitude, longitude) {
  logger.info('Fetching site meta datas with token:', JSON.stringify(token))
  const baseUrl = config.get('newRicardoSiteMetaData')
  const apiUrl = `${baseUrl}?page=1&networks[]=4&with-closed=false&with-pollutants=true&latest-measurement=true&latitude=${latitude}&longitude=${longitude}&distance=60`
  const response = await proxyFetch(apiUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  })

  let data
  if (response.ok) {
    data = await response.json()
  }
  logger.info('Site meta datas response data:', JSON.stringify(data))
  return data
}

async function newRicardoAPI(region, latitude, longitude) {
  try {
    logger.info('Starting site meta data fetch script...')
    const token = await getBearerToken()
    logger.info('Received token:', JSON.stringify(token))
    logger.info(`Processing region: ${region}`)
    const siteMetaDatas = await fetchSiteMetaDatas(token, latitude, longitude)
    logger.info('Fetched siteMetaDatas:', JSON.stringify(siteMetaDatas))
    const result = []
    if (siteMetaDatas && Array.isArray(siteMetaDatas.member)) {
      for (const site of siteMetaDatas.member.slice(0, 10)) {
        const { siteId, siteName, areaType, siteType } = site
        logger.info('Processing site object:', JSON.stringify(site))
        let distanceFromPoint = null
        if (
          site &&
          Object.prototype.hasOwnProperty.call(site, 'distanceFromPoint')
        ) {
          const val = site.distanceFromPoint
          if (typeof val === 'number') {
            distanceFromPoint = val
          } else if (typeof val === 'string' && val.trim() !== '') {
            const parsed = parseFloat(val)
            distanceFromPoint = isNaN(parsed) ? null : parsed
          }
        }
        const areaTypeSiteType =
          `${siteType || ''}${areaType ? ' ' + areaType : ''}`.trim()
        result.push({
          siteId,
          siteName,
          areaTypeSiteType,
          distanceFromPoint
        })
      }
    } else {
      logger.info('siteMetaDatas.member is not an array or missing')
    }
    const allSitesResults = {}
    for (const site of result) {
      if (!site.siteId) continue
      const siteId = site.siteId
      const siteName = site.siteName
      const measurementsBaseUrl = config.get('pollutantsMeasurementsUrl')
      const measurementsUrl = `${measurementsBaseUrl}?station-id=${siteId}&latest-measurement=true`
      logger.info(`Fetching pollutant measurements for siteId: ${siteId}`)
      const measurementsResponse = await proxyFetch(measurementsUrl, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (measurementsResponse.ok) {
        const measurementsData = await measurementsResponse.json()

        logger.info('Final Data', JSON.stringify(measurementsData))
        const allowedPollutantsNormalized = [
          'PM10',
          'PM2.5',
          'Ozone',
          'Nitrogen dioxide',
          'Sulphur dioxide'
        ]
        function normalizePollutantName(name) {
          if (!name) return ''
          return name
            .replace(
              /PM<sub>10<\/sub> particulate matter \(Hourly measured\)/,
              'PM10'
            )
            .replace(
              /PM<sub>2\.5<\/sub> particulate matter \(Hourly measured\)/,
              'PM2.5'
            )
            .replace(/<[^>]+>/g, '')
            .trim()
        }
        let filteredMeasurements = []
        let measurementMembers = []
        if (measurementsData.member) {
          if (Array.isArray(measurementsData.member)) {
            measurementMembers = measurementsData.member
          } else {
            measurementMembers = [measurementsData.member]
          }
          // Filter for allowed pollutants
          const filtered = measurementMembers.filter((obj) =>
            allowedPollutantsNormalized.includes(
              normalizePollutantName(obj.pollutantName)
            )
          )
          // Keep only the latest measurement per pollutant
          const latestByPollutant = {}
          for (const obj of filtered) {
            const normName = normalizePollutantName(obj.pollutantName)
            if (
              !latestByPollutant[normName] ||
              new Date(obj.endDateTime) >
                new Date(latestByPollutant[normName].endDateTime)
            ) {
              latestByPollutant[normName] = obj
            }
          }
          filteredMeasurements = Object.values(latestByPollutant)
        }
        // Normalize pollutantName for output
        const normalizedFilteredMeasurements = filteredMeasurements.map(
          (obj) => ({
            ...obj,
            pollutantName: normalizePollutantName(obj.pollutantName)
          })
        )
        const outputData = {
          siteId,
          siteName,
          measurements: normalizedFilteredMeasurements
        }
        allSitesResults[siteId] = outputData
        // Remove per-site file writing
      } else {
        logger.info(
          'Failed to fetch pollutant measurements:',
          JSON.stringify(measurementsResponse.status)
        )
      }
    }
    // After all sites processed, write consolidated file
    /* const finalDataDir = path.resolve(__dirname, 'finalData')
    if (!fs.existsSync(finalDataDir)) {
      fs.mkdirSync(finalDataDir, { recursive: true })
    }
    const consolidatedFilePath = path.resolve(finalDataDir, 'allSitesData.json')
    fs.writeFileSync(
      consolidatedFilePath,
      JSON.stringify(allSitesResults, null, 2),
      'utf-8'
    )
    logger.info('Consolidated data written to:', consolidatedFilePath) */

    // Transform allSitesResults to required array structure
    const finalArray = []
    for (const siteId in allSitesResults) {
      const siteData = allSitesResults[siteId]
      const areaName = siteData.siteName
      for (const meas of siteData.measurements) {
        const value =
          typeof meas.value === 'number' ? Number(meas.value.toFixed(2)) : null
        if (value !== null && value >= 0) {
          finalArray.push({
            apiPollutantAreaName: areaName,
            apiPollutantName: meas.pollutantName,
            apiPollutantValue: value.toString()
          })
        }
      }
    }
    // Save the output array to allSiteResults.json
    /* const finalArrayPath = path.resolve(finalDataDir, 'allSiteResults.json')
    fs.writeFileSync(
      finalArrayPath,
      JSON.stringify(finalArray, null, 2),
      'utf-8'
    ) */
    // logger.info('Final mapped array written to:', finalArrayPath)
    return finalArray
  } catch (err) {
    logger.info('Error:', err && err.stack ? err.stack : JSON.stringify(err))
    return []
  }
}

function pollutantsValueCheck(pollutantNameInsideTab, pollutantValueTabs) {
  const value = Number(pollutantValueTabs.trim())
  switch (pollutantNameInsideTab.trim()) {
    case 'Ozone':
      if (value <= 100) return 'Low'
      if (value > 100 && value <= 160) return 'Moderate'
      if (value > 160 && value <= 240) return 'High'
      if (value > 240) return 'Very high'
      break
    case 'PM2.5':
      if (value <= 36) return 'Low'
      if (value > 36 && value <= 53) return 'Moderate'
      if (value > 53 && value <= 70) return 'High'
      if (value > 70) return 'Very high'
      break
    case 'PM10':
      if (value <= 50) return 'Low'
      if (value > 50 && value <= 75) return 'Moderate'
      if (value > 75 && value <= 100) return 'High'
      if (value > 100) return 'Very high'
      break
    case 'Nitrogen dioxide':
      if (value <= 200) return 'Low'
      if (value > 200 && value <= 400) return 'Moderate'
      if (value > 400 && value <= 600) return 'High'
      if (value > 600) return 'Very high'
      break
    case 'Sulphur dioxide':
      if (value <= 266) return 'Low'
      if (value > 266 && value <= 710) return 'Moderate'
      if (value > 710 && value <= 1064) return 'High'
      if (value > 1064) return 'Very high'
      break
    default:
      return ''
  }
}

describe('new ricardo validation', () => {
  const newRicardoData = path.resolve(
    __dirname,
    '../testdata/newRicardoPollutants.json'
  )
  const newRicardoPollutant = JSON.parse(
    fs.readFileSync(newRicardoData, 'utf-8')
  )
  const regionsWithLatLong = newRicardoPollutant.filter(
    (item) => item.latitude && item.longitude
  )
  for (const regionObj of regionsWithLatLong) {
    const { region, latitude, longitude, NI } = regionObj
    it(`ricardo API for region ${region}`, async () => {
      logger.info('--- new ricardo validation StartScenario --------')
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
      const getAPIPollutantData = await newRicardoAPI(
        region,
        latitude,
        longitude
      )
      /* console.log(
        `Output data for region ${region}:`,
        JSON.stringify(outputData)
      ) */
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
      try {
        await ForecastMainPage.pollutantsNameTableLinks.scrollIntoView()
      } catch (error) {
        logger.info('ERRORINSCROLLINTOVIEW')
        logger.error(error)
      }
      const tabResults = []
      for (
        let i = 0;
        i < (await ForecastMainPage.pollutantTabsNameItself.length);
        i++
      ) {
        if (await ForecastMainPage.pollutantTabsNameItself[i].isDisplayed()) {
          await ForecastMainPage.pollutantTabsNameItself[i].click()
          const pollutantAreaName =
            await ForecastMainPage.pollutantAreaNames[i].getText()
          const tabResultItems = []
          for (
            let j = 0;
            j < (await ForecastMainPage.pollutantNameTabs.length);
            j++
          ) {
            const pollutantNameInsideTab =
              await ForecastMainPage.pollutantNameTabs[j].getText()
            const pollutantValueTabs =
              await ForecastMainPage.pollutantValueTabs[j].getText()
            const pollutantRangeTabs =
              await ForecastMainPage.pollutantRangeTabs[j].getText()
            tabResultItems.push({
              pollutantNameInsideTab,
              pollutantValueTabs,
              pollutantRangeTabs
            })
          }
          tabResults.push({
            pollutantAreaName,
            tabResultItems
          })
        }
      }
      // console.log(JSON.stringify(tabResults))
      // Remove objects with all empty values from tabResultItems in tabResults
      const filteredTabResults = tabResults.map((areaObj) => ({
        pollutantAreaName: areaObj.pollutantAreaName,
        tabResultItems: areaObj.tabResultItems.filter(
          (obj) =>
            obj.pollutantNameInsideTab !== '' ||
            obj.pollutantValueTabs !== '' ||
            obj.pollutantRangeTabs !== ''
        )
      }))
      // console.log('Result Webapp-->', JSON.stringify(filteredTabResults))
      // console.log('Result API-->', JSON.stringify(getAPIPollutantData))

      // Compare UI and API pollutant values
      for (const areaObj of filteredTabResults) {
        const areaName = areaObj.pollutantAreaName
        for (const tabItem of areaObj.tabResultItems) {
          const pollutantName = tabItem.pollutantNameInsideTab
          const pollutantValueTabs = tabItem.pollutantValueTabs
          // Find matching API result
          const apiMatch = getAPIPollutantData.find(
            (apiObj) =>
              apiObj.apiPollutantAreaName === areaName &&
              apiObj.apiPollutantName === pollutantName
          )
          logger.info(
            `Comparing UI and API values for ${areaName} - ${pollutantName}: UI=${pollutantValueTabs}, API=${apiMatch ? apiMatch.apiPollutantValue : 'N/A'}`
          )
          if (apiMatch) {
            const apiPollutantValue = apiMatch.apiPollutantValue
            await expect(apiPollutantValue).toMatch(pollutantValueTabs)
          }
        }
      }
      // Check range of pollutant values like low, moderate, high, very high
      for (const areaObj of filteredTabResults) {
        for (const tabItem of areaObj.tabResultItems) {
          const bucket = pollutantsValueCheck(
            tabItem.pollutantNameInsideTab,
            tabItem.pollutantValueTabs
          )
          await expect(bucket).toMatch(tabItem.pollutantRangeTabs)
        }
      }

      await browser.deleteCookies(['airaqie_cookie'])
      logger.info('--- EndScenario New Ricardo Validation search --------')
    })
  }
})
