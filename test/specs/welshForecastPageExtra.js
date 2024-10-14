import startNowPage from 'page-objects/startnowpage'
import locationSearchPage from 'page-objects/locationsearchpage'
import ForecastMainPage from 'page-objects/forecastmainpage'
import LocationMatchPage from 'page-objects/locationmatchpage'
import fs from 'node:fs'
import { browser, expect } from '@wdio/globals'
import cookieBanner from 'page-objects/cookieBanner'
import createLogger from 'helpers/logger'
const welshToolTipData = JSON.parse(
  fs.readFileSync('test/testdata/welshToolTip.json')
)
const logger = createLogger()
welshToolTipData.forEach(({ region, area, areaMessage, NI }) => {
  describe('Welsh - Forecast Main Page - Extra', () => {
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
      // Click Welsh Toogle button
      await locationSearchPage.linkButtonWelsh.click()
      // Welsh Accordian link
      const accordianText =
        'Sut y gall lefelau gwahanol o lygredd aer effeithio ar iechyd'
      const accordianTextReceived =
        await ForecastMainPage.daqiAccordian.getText()
      await expect(accordianTextReceived).toMatch(accordianText)
      await ForecastMainPage.daqiAccordian.click()
      const accordianHeading = 'Mynegai'
      const accordianHeadingReceived =
        await ForecastMainPage.daqiAccordianHeaderIndex.getText()
      await expect(accordianHeadingReceived).toMatch(accordianHeading)
      await ForecastMainPage.daqiAccordian.click()

      // await browser.scroll(0, 1500)
      await ForecastMainPage.pollutantsNameTableLinks.scrollIntoView()
      const LatestIconMessage =
        'Mae’r darlleniadau’n cael eu mesur bob awr.Mae’r uned µg/㎥ yn sefyll am ficrogramau (miliynfed o gram) am bob metr ciwbig o aer.'
      const getPollutantStationStr =
        await ForecastMainPage.stationFirstName.getText()
      const readingMeasuredWelshPara =
        await ForecastMainPage.readingMeasuredPara.getText()
      await expect(readingMeasuredWelshPara).toMatch(LatestIconMessage)

      if (getPollutantStationStr === area) {
        const stationAreaTypeWelshPara =
          await ForecastMainPage.stationAreaTypePara.getText()
        await expect(stationAreaTypeWelshPara).toMatch(areaMessage)
      } else {
        logger.info(
          'Temporarily the expected first station was not displayed!!!'
        )
      }

      await browser.deleteCookies(['airaqie_cookie'])
      logger.info('--- FMPEx Welsh EndScenario Area type and Units --------')
    })
  })
})
