import startNowPage from '../page-objects/startnowpage.js'
import locationSearchPage from '../page-objects/locationsearchpage.js'
import LocationMatchPage from '../page-objects/locationmatchpage.js'
import ForecastMainPage from '../page-objects/forecastmainpage.js'
import { browser, expect } from '@wdio/globals'
import cookieBanner from '../page-objects/cookieBanner.js'
import fs from 'node:fs'
const locationMatchRegion = JSON.parse(
  fs.readFileSync('test/testdata/locationMatchRegion.json')
)

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
      const getDaqiHeaderText =
        await ForecastMainPage.daqiOfCurrentDaysHeader.getText()
      const getDaqiHeader = getDaqiHeaderText.split('\n')[0]
      await expect(getDaqiHeader).toMatch('Lefelau llygredd aer a ragwelir')
      // Click English Toogle button
      await locationSearchPage.linkButtonEnglish.click()
      const getDaqiHeaderTextEng =
        await ForecastMainPage.daqiOfCurrentDaysHeader.getText()
      await expect(getDaqiHeaderTextEng).toMatch(
        'Predicted air pollution levels'
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
      const getDaqiHeaderTextWel =
        await ForecastMainPage.daqiOfCurrentDaysHeader.getText()
      const getDaqiHeaderWel = getDaqiHeaderTextWel.split('\n')[0]
      await expect(getDaqiHeaderWel).toMatch('Lefelau llygredd aer a ragwelir')
      await browser.deleteCookies(['airaqie_cookie'])
    })
  })
})
