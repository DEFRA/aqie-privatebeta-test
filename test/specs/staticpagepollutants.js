/* eslint-disable wdio/no-pause */
import o3StaticPage from 'page-objects/o3staticpage'
import no2StaticPage from 'page-objects/no2staticpage'
import so2StaticPage from 'page-objects/so2staticpage'
import pm10StaticPage from 'page-objects/pm10staticpage'
import pm25StaticPage from 'page-objects/pm25staticpage'
import ForecastMainPage from 'page-objects/forecastmainpage'
import locationSearchPage from 'page-objects/locationsearchpage'
import LocationMatchPage from 'page-objects/locationmatchpage'
import cookieBanner from 'page-objects/cookieBanner'
import startNowPage from 'page-objects/startnowpage'
import createLogger from 'helpers/logger'
import { browser, expect } from '@wdio/globals'
// import defraPrototype from './defraPrototype.js'
import fs from 'node:fs'
const dynlocationValue = JSON.parse(
  fs.readFileSync('test/testdata/dynamicForecast.json')
)
const logger = createLogger()
async function checkPositions(array) {
  const expectedOrder = [
    'PM2.5',
    'PM10',
    'Nitrogen dioxide',
    'Ozone',
    'Sulphur dioxide'
  ]
  const filteredExpectedOrder = expectedOrder.filter((item) =>
    array.includes(item)
  )
  const resultMatchingPosition = filteredExpectedOrder.every(
    (element, index) => element === array[index]
  )
  return resultMatchingPosition
}

async function pollutantsPageNavigations(matchPollutantSubHeader) {
  if (matchPollutantSubHeader === 'Ozone') {
    const link = await $('=' + matchPollutantSubHeader + '')
    await link.click()
    const headerO3 = 'Ozone (O₃)'
    const SubHeader1Value = 'Sources of ozone'
    const SubHeader2Value = 'Health effects '
    const o3Header = await o3StaticPage.o3HeaderDisplay.getText()
    await expect(headerO3).toMatch(o3Header)
    const o3SubHeader1 = await o3StaticPage.o3SubHeaderDisplay[0].getText()
    await expect(SubHeader1Value).toMatch(o3SubHeader1)
    const o3SubHeader2 = await o3StaticPage.o3SubHeaderDisplay[1].getText()
    await expect(SubHeader2Value).toMatch(o3SubHeader2)
    await browser.back()
  } else if (matchPollutantSubHeader === 'Nitrogen dioxide') {
    const link = await $('=' + matchPollutantSubHeader + '')
    await link.click()
    const headerNO2 = 'Nitrogen dioxide (NO₂)'
    const SubHeader1Value = 'Sources of nitrogen dioxide'
    const SubHeader2Value = 'Health effects '
    const no2Header = await no2StaticPage.no2HeaderDisplay.getText()
    await expect(headerNO2).toMatch(no2Header)
    const no2SubHeader1 = await no2StaticPage.no2SubHeaderDisplay[0].getText()
    await expect(SubHeader1Value).toMatch(no2SubHeader1)
    const no2SubHeader2 = await no2StaticPage.no2SubHeaderDisplay[1].getText()
    await expect(SubHeader2Value).toMatch(no2SubHeader2)
    await browser.back()
  } else if (matchPollutantSubHeader === 'Sulphur dioxide') {
    const link = await $('=' + matchPollutantSubHeader + '')
    await link.click()
    const headerSO2 = 'Sulphur dioxide (SO₂)'
    const SubHeader1Value = 'Sources of sulphur dioxide'
    const SubHeader2Value = 'Health effects '
    const so2Header = await so2StaticPage.so2HeaderDisplay.getText()
    await expect(headerSO2).toMatch(so2Header)
    const so2SubHeader1 = await so2StaticPage.so2SubHeaderDisplay[0].getText()
    await expect(SubHeader1Value).toMatch(so2SubHeader1)
    const so2SubHeader2 = await so2StaticPage.so2SubHeaderDisplay[1].getText()
    await expect(SubHeader2Value).toMatch(so2SubHeader2)
    await browser.back()
  } else if (
    matchPollutantSubHeader === 'PM 2.5' ||
    matchPollutantSubHeader === 'PM2.5'
  ) {
    const link = await $('=' + matchPollutantSubHeader + '')
    await link.click()
    const headerPM25 = 'Particulate matter (PM2.5)'
    const SubHeader1Value = 'Sources of PM2.5'
    const SubHeader2Value = 'Health effects '
    const pm25Header = await pm25StaticPage.pm25HeaderDisplay.getText()
    await expect(headerPM25).toMatch(pm25Header)
    const pm25SubHeader1 =
      await pm25StaticPage.pm25SubHeaderDisplay[0].getText()
    await expect(SubHeader1Value).toMatch(pm25SubHeader1)
    const pm25SubHeader2 =
      await pm25StaticPage.pm25SubHeaderDisplay[1].getText()
    await expect(SubHeader2Value).toMatch(pm25SubHeader2)
    await browser.back()
  } else if (
    matchPollutantSubHeader === 'PM 10' ||
    matchPollutantSubHeader === 'PM10'
  ) {
    const link = await $('=' + matchPollutantSubHeader + '')
    await link.click()
    const headerPM10 = 'Particulate matter (PM10)'
    const SubHeader1Value = 'Sources of PM10'
    const SubHeader2Value = 'Health effects '
    const pm10Header = await pm25StaticPage.pm25HeaderDisplay.getText()
    await expect(headerPM10).toMatch(pm10Header)
    const pm10SubHeader1 =
      await pm10StaticPage.pm10SubHeaderDisplay[0].getText()
    await expect(SubHeader1Value).toMatch(pm10SubHeader1)
    const pm10SubHeader2 =
      await pm10StaticPage.pm10SubHeaderDisplay[1].getText()
    await expect(SubHeader2Value).toMatch(pm10SubHeader2)
    await browser.back()
  }
}

describe('Pollutants Static Page content', () => {
  dynlocationValue.forEach(
    ({
      region,
      nearestRegionForecast,
      nearestRegionPollutantsSta1,
      nearestRegionPollutantsSta2,
      nearestRegionPollutantsSta3,
      NI
    }) => {
      it(`pollutants redirection to its page from forecast '${region}'`, async () => {
        logger.info(
          '--- StcPoll StartScenario pollutants redirection to its page from forecast --------'
        )
        await browser.deleteCookies(['airaqie_cookie'])
        await browser.url(' /search-location')
        await browser.maximizeWindow()
        await browser.url('')
        await browser.maximizeWindow()
        // Handle the cookie banner
        if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
          await cookieBanner.rejectButtonCookiesDialog.click()
          await cookieBanner.hideButtonHideDialog.click()
        }
        // Start-Page-block
        await startNowPage.startNowBtnClick()
        // location-block
        const LocationHeaderText = 'Where do you want to check?'
        const locationESWSearchBoxText = 'Enter a location or postcode'
        // Location-block
        const getLocationSearchHeaderText =
          await locationSearchPage.getLocationSearchHeader.getText()
        await expect(getLocationSearchHeaderText).toMatch(LocationHeaderText)
        await locationSearchPage.clickESWRadiobtn()
        const getESWLocationSearchBoxText =
          await locationSearchPage.eswLocationBoxText.getText()
        await expect(getESWLocationSearchBoxText).toMatch(
          locationESWSearchBoxText
        )
        await locationSearchPage.setUserESWRegion(region)
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
        const pollutantSubHeader = 'How air pollutants can affect your health'
        await ForecastMainPage.timestampBlockForecastPage.scrollIntoView()
        // for the sub header "How air pollutants can affect your health"
        const matchPollutantSubHeader =
          await ForecastMainPage.pollutantsHeaderLinks.getText()
        await expect(pollutantSubHeader).toMatch(matchPollutantSubHeader)
        for (
          let i = 0;
          i < (await ForecastMainPage.pollutantsLink.length);
          i++
        ) {
          const matchPollutantSubHeader =
            await ForecastMainPage.pollutantsLink[i].getText()
          await pollutantsPageNavigations(matchPollutantSubHeader)
        }

        await browser.execute(() => {
          document.body.style.zoom = '20%' // Adjust the percentage as needed
        })
        // await ForecastMainPage.pollutantNameHeader1.scrollIntoView();

        await browser.execute(() => {
          document.body.style.zoom = '100%' // Adjust the percentage as needed
        })
        // await ForecastMainPage.pollutantsNameTableLinks.scrollIntoView({ block: 'start'});
        // await browser.pause(1000)
        for (
          let j = 0;
          j < (await ForecastMainPage.pollutantNameCollections.length);
          j++
        ) {
          await ForecastMainPage.pollutantNameCollections[j].scrollIntoView()
          const pollutantFromTable =
            await ForecastMainPage.pollutantNameCollections[j].getText()
          await pollutantsPageNavigations(pollutantFromTable)
        }
        const arrayStaticPollutant = []
        const getTableValues =
          await ForecastMainPage.pollutantsFirstTableCollections()
        for (let k = 0; k < getTableValues.length; k += 3) {
          const splitArray = getTableValues[k].split('\n')
          arrayStaticPollutant.push(splitArray[0])
        }
        // Check for the position of pollutant of first pollutant table
        const isCorrectOrder = await checkPositions(arrayStaticPollutant)
        await expect(isCorrectOrder.toString()).toMatch('true')

        await browser.deleteCookies(['airaqie_cookie'])
        logger.info(
          '--- StcPoll EndScenario pollutants redirection to its page from forecast --------'
        )
      })
    }
  )
})
