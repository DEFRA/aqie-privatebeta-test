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
      // await browser.scroll(0, 1500)
      await ForecastMainPage.pollutantsNameTableLinks.scrollIntoView()
      const LatestIconMessage = `Readings are measured every hour. The unit µg/m3 stands for micrograms (one millionth of a gram) per cubic metre of air.`
      // Get all <p> elements
      const paragraphs = await ForecastMainPage.forecastMainPagePara
      let setReadingMeasuredPara = false
      // Loop through each paragraph and log index and text
      for (let i = 0; i < paragraphs.length; i++) {
        const readingMeasuredPara = await paragraphs[i].getText()
        if (readingMeasuredPara === LatestIconMessage) {
          setReadingMeasuredPara = true
          break
        }
      }
      await expect(setReadingMeasuredPara).toBe(true)
      let setStationAreaTypeText = false
      const getPollutantStationStr =
        await ForecastMainPage.stationFirstName.getText()

      if (getPollutantStationStr === area) {
        for (let i = 0; i < paragraphs.length; i++) {
          const stationAreaTypeText = await paragraphs[i].getText()
          if (stationAreaTypeText === areaMessage) {
            setStationAreaTypeText = true
            break
          }
        }
        await expect(setStationAreaTypeText).toBe(true)
      }
      await browser.deleteCookies(['airaqie_cookie'])
      logger.info('--- FMPEx EndScenario Area type and Units --------')
    })
  }
})
