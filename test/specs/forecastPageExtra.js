import startNowPage from 'page-objects/startnowpage'
import locationSearchPage from 'page-objects/locationsearchpage'
import ForecastMainPage from 'page-objects/forecastmainpage'
import LocationMatchPage from 'page-objects/locationmatchpage'
import cookieBanner from 'page-objects/cookieBanner'
import fs from 'node:fs'
import { browser, expect } from '@wdio/globals'
import createLogger from 'helpers/logger'
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
      // Function to get the last word in a sentence
      const getLastWord = (sentence) => {
        const fullSentence = sentence.split('\n')
        const words = fullSentence[0].split(' ')
        return words[words.length - 1] // Get the last word
      }
      const currentDayDaqiIndex =
        await ForecastMainPage.daqiOfCurrentDaysHeader.getText()
      const currentIndexValue = getLastWord(currentDayDaqiIndex)
      // await browser.scroll(0, 1500)
      await ForecastMainPage.pollutantsNameTableLinks.scrollIntoView()
      const LatestIconMessage = `Readings are measured every hour. The unit µg/m3 stands for micrograms (one millionth of a gram) per cubic metre of air.`
      const getPollutantStationStr =
        await ForecastMainPage.stationFirstName.getText()
      if (currentIndexValue === 'low') {
        const readingMeasuredPara =
          await ForecastMainPage.readingMeasuredPara.getText()
        await expect(readingMeasuredPara).toMatch(LatestIconMessage)
      } else {
        const readingMeasuredModeratePara =
          await ForecastMainPage.readingMeasuredModeratePara.getText()
        await expect(readingMeasuredModeratePara).toMatch(LatestIconMessage)
      }

      if (getPollutantStationStr === area) {
        if (currentIndexValue === 'low') {
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
