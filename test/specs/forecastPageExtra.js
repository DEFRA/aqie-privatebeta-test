import startNowPage from '../page-objects/startnowpage.js'
import locationSearchPage from '../page-objects/locationsearchpage.js'
import ForecastMainPage from '../page-objects/forecastmainpage.js'
import LocationMatchPage from '../page-objects/locationmatchpage.js'
import cookieBanner from '../page-objects/cookieBanner.js'
import fs from 'node:fs'
import { browser, expect } from '@wdio/globals'
import createLogger from '../helpers/logger.js'
const toolTipData = JSON.parse(fs.readFileSync('test/testdata/toolTip.json'))
const logger = createLogger()

describe('Forecast Main Page - Extra', () => {
  for (const toolTip of toolTipData) {
    const { region, area, areaMessage, NI } = toolTip

    it(`Area-Type and Units - ${region}`, async () => {
      logger.info('--- FMPEx StartScenario Area type and Units --------')
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

      // Convert DAQI numeric value to text description
      function getDaqiDescription(daqiValue) {
        const numericValue = parseInt(daqiValue, 10)

        if (numericValue >= 1 && numericValue <= 3) {
          return 'Low'
        } else if (numericValue >= 4 && numericValue <= 6) {
          return 'Moderate'
        } else if (numericValue >= 7 && numericValue <= 9) {
          return 'High'
        } else if (numericValue === 10) {
          return 'Very High'
        } else {
          return 'Unknown' // For values outside the expected range
        }
      }

      // ...existing code...

      //  const currentDayDaqiIndex = await ForecastMainPage.daqiOfCurrentDaysHeader.getText()
      const currentIndexValueNum = await ForecastMainPage.daqiForecastValue()
      const currentIndexValue = await getDaqiDescription(currentIndexValueNum)
      // await browser.scroll(0, 1500)
      await ForecastMainPage.pollutantsNameTableLinks.scrollIntoView()
      const LatestIconMessage = `Readings are measured every hour. The unit µg/m3 stands for micrograms (one millionth of a gram) per cubic metre of air.`
      const getPollutantStationStr =
        await ForecastMainPage.stationFirstName.getText()
      if (currentIndexValue === 'Low') {
        const readingMeasuredPara =
          await ForecastMainPage.readingMeasuredPara.getText()
        await expect(readingMeasuredPara).toMatch(LatestIconMessage)
      } else {
        const readingMeasuredModeratePara =
          await ForecastMainPage.readingMeasuredModeratePara.getText()
        await expect(readingMeasuredModeratePara).toMatch(LatestIconMessage)
      }
      if (getPollutantStationStr === area) {
        if (currentIndexValue === 'Low') {
          const stationAreaTypeText =
            await ForecastMainPage.stationAreaTypePara.getText()
          await expect(stationAreaTypeText).toMatch(areaMessage)
        } else {
          const stationAreaTypeText =
            await ForecastMainPage.stationAreaTypeModeratePara.getText()
          await expect(stationAreaTypeText).toMatch(areaMessage)
        }
      } else {
        logger.info(
          'Temporarily the expected first station was not displayed!!!'
        )
      }
      await browser.deleteCookies(['airaqie_cookie'])
      logger.info('--- FMPEx EndScenario Area type and Units --------')
    })
  }
})
