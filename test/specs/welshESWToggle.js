import startNowPage from '../page-objects/startnowpage.js'
import locationSearchPage from '../page-objects/locationsearchpage.js'
import LocationMatchPage from '../page-objects/locationmatchpage.js'
import ForecastMainPage from '../page-objects/forecastmainpage.js'
import { browser, expect } from '@wdio/globals'
import cookieBanner from '../page-objects/cookieBanner.js'
import createLogger from '../helpers/logger.js'
import fs from 'node:fs'
const locationMatchRegion = JSON.parse(
  fs.readFileSync('test/testdata/locationMatchRegion.json')
)
const logger = createLogger()

describe('ESW-Toggle-Flow', () => {
  it('Welsh-English Transalation', async () => {
    await browser.url('')
    await browser.maximizeWindow()
    // Handle the cookie banner
    if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
      await cookieBanner.rejectButtonCookiesDialog.click()
      await cookieBanner.hideButtonHideDialog.click()
    }
    if (await startNowPage.toWelshTranslationLink.isClickable()) {
      await startNowPage.toWelshTranslationLink.click()
      const StartPageHeaderText = 'Gwirio ansawdd aer'
      const getStartPageHeaderText =
        await startNowPage.welshStartNowPageHeaderText.getText()
      await expect(getStartPageHeaderText).toMatch(StartPageHeaderText)
      if (await startNowPage.toEnglishTranslationLink.isClickable()) {
        await startNowPage.toEnglishTranslationLink.click()
        const StartPageHeaderText = 'Check air quality'
        const getStartPageHeaderText =
          await startNowPage.startNowPageHeaderText.getText()
        await expect(getStartPageHeaderText).toMatch(StartPageHeaderText)
      }
    }
    await startNowPage.toWelshTranslationLink.click()
  })
  locationMatchRegion.forEach(({ region }) => {
    it('Welsh-Location search and match', async () => {
      await startNowPage.startNowBtnClick()
      const toggleLinkCygetatt =
        await locationSearchPage.linkToggleButtonsCy.getAttribute(
          'aria-current'
        )
      if (toggleLinkCygetatt) {
        const LocationHeaderText = 'Ble hoffech chi wirio?'
        const getLocationSearchHeaderText =
          await locationSearchPage.getLocationSearchHeader.getText()
        await expect(getLocationSearchHeaderText).toMatch(LocationHeaderText)
        const eswRadioBtnText = 'Lloegr, Yr Alban, Cymru'
        const niRadioBtnText = 'Gogledd Iwerddon'
        const getEswRadioBtnText =
          await locationSearchPage.eswRadiobtnText.getText()
        await expect(getEswRadioBtnText).toMatch(eswRadioBtnText)
        const getNiRadioBtnText =
          await locationSearchPage.niRadiobtnText.getText()
        await expect(getNiRadioBtnText).toMatch(niRadioBtnText)
      }
      await locationSearchPage.linkToggleButtonsEng.click()
      const LocationHeaderText = 'Where do you want to check?'
      const getLocationSearchHeaderText =
        await locationSearchPage.getLocationSearchHeader.getText()
      await expect(getLocationSearchHeaderText).toMatch(LocationHeaderText)
      await locationSearchPage.linkToggleButtonsCy.click()
      await locationSearchPage.clickESWRadiobtn()
      await locationSearchPage.setUserESWRegion(region)
      const getSubmitTextWelsh = await locationSearchPage.continueBtn.getText()
      await expect(getSubmitTextWelsh).toMatch('Parhau')
      await locationSearchPage.clickContinueBtn()
      // await browser.pause(3000)
      // Location Match page
      const getLocationMatchHeaderText =
        await LocationMatchPage.headerTextMatch.getText()
      await expect(getLocationMatchHeaderText).toMatch(
        'Lleoliadau yn cyfateb ' + "'" + region + "'"
      )
      // Click English Toogle button
      await locationSearchPage.linkButtonEnglish.click()
      const getLocationMatchHeaderTextEng =
        await LocationMatchPage.headerTextMatch.getText()
      await expect(getLocationMatchHeaderTextEng).toMatch(
        'Locations matching ' + "'" + region + "'"
      )
      // await browser.pause(3000)
      await LocationMatchPage.firstLinkOfLocationMatch.click()
      // Click Welsh Toogle button
      await locationSearchPage.linkButtonWelsh.click()
      try {
        await ForecastMainPage.airPollutantsMonitoredHeader.scrollIntoView()
      } catch (error) {
        logger.info('Error scrolling to subheader pollutants')
        logger.error(error)
      }
      const getWelshAirPollutantsMonitoredHeader =
        await ForecastMainPage.airPollutantsMonitoredHeader.getText()
      await expect(getWelshAirPollutantsMonitoredHeader).toMatch(
        'Llygryddion aer sy’n cael eu monitro gerllaw'
      )
      // Click English Toogle button
      await locationSearchPage.linkButtonEnglish.click()
      try {
        await ForecastMainPage.airPollutantsMonitoredHeader.scrollIntoView()
      } catch (error) {
        logger.info('Error scrolling to subheader pollutants')
        logger.error(error)
      }
      const getEngAirPollutantsMonitoredHeader =
        await ForecastMainPage.airPollutantsMonitoredHeader.getText()
      await expect(getEngAirPollutantsMonitoredHeader).toMatch(
        'Air pollutants monitored near by'
      )
      // Click Welsh Toogle button
      await locationSearchPage.linkButtonWelsh.click()
      const welshChangeSearchLocation =
        await ForecastMainPage.changeLocationLink.getText()
      await expect(welshChangeSearchLocation).toMatch('Newid lleoliad')
      await ForecastMainPage.changeLocationLink.click()
      const getLocationSearchHeaderTextbk =
        await locationSearchPage.getLocationSearchHeader.getText()
      await expect(getLocationSearchHeaderTextbk).toMatch(
        'Ble hoffech chi wirio?'
      )
      await locationSearchPage.clickESWRadiobtn()
      await locationSearchPage.setUserESWRegion('GL43YX')
      await locationSearchPage.clickContinueBtn()
      try {
        await ForecastMainPage.airPollutantsMonitoredHeader.scrollIntoView()
      } catch (error) {
        logger.info('Error scrolling to subheader pollutants')
        logger.error(error)
      }
      const getUKSummaryTitlebk =
        await ForecastMainPage.airPollutantsMonitoredHeader.getText()
      await expect(getUKSummaryTitlebk).toMatch(
        'Llygryddion aer sy’n cael eu monitro gerllaw'
      )
      await browser.deleteCookies(['airaqie_cookie'])
    })
  })
})
