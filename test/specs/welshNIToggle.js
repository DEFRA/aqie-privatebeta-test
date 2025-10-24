import startNowPage from '../page-objects/startnowpage.js'
import locationSearchPage from '../page-objects/locationsearchpage.js'
import ForecastMainPage from '../page-objects/forecastmainpage.js'
import { browser, expect } from '@wdio/globals'
import cookieBanner from '../page-objects/cookieBanner.js'
import createLogger from '../helpers/logger.js'

const logger = createLogger()
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
      try {
        await ForecastMainPage.airPollutantsMonitoredHeader.scrollIntoView()
      } catch (error) {
        logger.info('Error scrolling to subheader pollutants')
        logger.error(error)
      }
      const getUKSummaryTitle =
        await ForecastMainPage.airPollutantsMonitoredHeader.getText()
      await expect(getUKSummaryTitle).toMatch(
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
      const getUKSummaryTitlebk =
        await ForecastMainPage.airPollutantsMonitoredHeader.getText()
      await expect(getUKSummaryTitlebk).toMatch(
        'Air pollutants monitored near by'
      )
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
