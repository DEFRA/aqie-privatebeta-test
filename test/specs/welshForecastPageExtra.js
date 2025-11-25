import startNowPage from '../page-objects/startnowpage.js'
import locationSearchPage from '../page-objects/locationsearchpage.js'
import ForecastMainPage from '../page-objects/forecastmainpage.js'
import LocationMatchPage from '../page-objects/locationmatchpage.js'
import fs from 'node:fs'
import { browser, expect } from '@wdio/globals'
import cookieBanner from '../page-objects/cookieBanner.js'
import createLogger from '../helpers/logger.js'
const welshToolTipData = JSON.parse(
  fs.readFileSync('test/testdata/welshToolTip.json')
)
const logger = createLogger()
welshToolTipData.forEach(({ region, area, areaMessage, NI }) => {
  describe(`Welsh - Forecast Main Page - Extra region ${region}`, () => {
    it('Welsh Area type and Units', async () => {
      logger.info('--- FMPEx Welsh StartScenario Area type and Units --------')
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

      const getAllDaqiValuesOfTab =
        await ForecastMainPage.getAllDAQISelectedValues
      for (const visibleTab of getAllDaqiValuesOfTab) {
        if (await visibleTab.isDisplayed()) {
          await visibleTab.getText()
          break // stop after finding the visible one
        }
      }
      // Click Welsh Toogle button
      await locationSearchPage.linkButtonWelsh.click()
      // await browser.scroll(0, 1500)
      await ForecastMainPage.getHowAirPollutantsheader.scrollIntoView()
      const LatestIconMessage =
        'Mae’r darlleniadau’n cael eu mesur bob awr. Mae’r uned µg/m3 yn sefyll am ficrogramau (miliynfed o gram) am bob metr ciwbig o aer.'

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
      const getPollutantStationStr =
        await ForecastMainPage.stationFirstName.getText()

      let setStationAreaTypeText = false
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
      logger.info('--- FMPEx Welsh EndScenario Area type and Units --------')
    })
  })
})
