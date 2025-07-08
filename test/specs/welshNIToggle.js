import startNowPage from '../page-objects/startnowpage.js'
import locationSearchPage from '../page-objects/locationsearchpage.js'
import ForecastMainPage from '../page-objects/forecastmainpage.js'
import { browser, expect } from '@wdio/globals'
import cookieBanner from '../page-objects/cookieBanner.js'

describe('NI-Toggle Flow', () => {
  it('NI-Welsh-English Transalation', async () => {
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
    await startNowPage.startNowBtnClick()
    const toggleLinkCygetatt =
      await locationSearchPage.linkToggleButtonsCy.getAttribute('aria-current')
    if (toggleLinkCygetatt) {
      await locationSearchPage.clickNIRadiobtn()
      await locationSearchPage.setUserNIRegion('BT11FB')
      const getSubmitTextWelsh = await locationSearchPage.continueBtn.getText()
      await expect(getSubmitTextWelsh).toMatch('Parhau')
      await locationSearchPage.clickContinueBtn()
      const getUKSummaryTitle =
        await ForecastMainPage.pollutantsUKSummaryLinks.getText()
      await expect(getUKSummaryTitle).toMatch('Rhagolwg y DU')
      // Click English Toogle button
      await locationSearchPage.linkButtonEnglish.click()
      const getUKSummaryTitlebk =
        await ForecastMainPage.pollutantsUKSummaryLinks.getText()
      await expect(getUKSummaryTitlebk).toMatch('UK forecast')
      // Click Welsh Toogle button
      await locationSearchPage.linkButtonWelsh.click()
      const welshChangeSearchLocation =
        await ForecastMainPage.changeLocationLink.getText()
      await expect(welshChangeSearchLocation).toMatch('Newid lleoliad')
      await ForecastMainPage.changeLocationLink.click()
      await browser.deleteCookies(['airaqie_cookie'])
    }
  })
})
