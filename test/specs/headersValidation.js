import headersValidation from '../page-objects/headersObject.js'
import startNowPage from '../page-objects/startnowpage.js'
import locationSearchPage from '../page-objects/locationsearchpage.js'
import LocationMatchPage from '../page-objects/locationmatchpage.js'
import cookieBanner from '../page-objects/cookieBanner.js'
import createLogger from '../helpers/logger.js'
import { browser, expect } from '@wdio/globals'
import fs from 'node:fs'
const locationMatchRegion = JSON.parse(
  fs.readFileSync('test/testdata/locationMatchRegion.json')
)
const logger = createLogger()
locationMatchRegion.forEach(({ region }) => {
  describe('Headers Validation', () => {
    it('CrownLink_CLAQ', async () => {
      logger.info('--- HeadVal StartScenario CrownLink_CLAQ --------')
      await browser.deleteCookies()
      await browser.url('')
      await browser.maximizeWindow()
      // Handle the cookie banner
      if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
        await cookieBanner.rejectButtonCookiesDialog.click()
        await cookieBanner.hideButtonHideDialog.click()
      }
      const govukLink = await headersValidation.govUKCrownLink.getText()
      await expect(govukLink.split(' ').pop()).toMatch('GOV.UK')
      const getGovUKLink =
        await headersValidation.govUKCrownLink.getAttribute('href')
      await expect(getGovUKLink).toMatch('https://www.gov.uk/')
      // Commenting below because cdp not supporting navigation to 3rd party site for now
      // await headersValidation.govUKCrownLink.click()
      // const browserURL = await browser.getUrl()
      // await browser.back()
      const StartPageHeaderText = 'Check air quality'
      const getStartPageHeaderText =
        await startNowPage.startNowPageHeaderText.getText()
      await expect(getStartPageHeaderText).toMatch(StartPageHeaderText)
      await startNowPage.startNowBtnClick()
      const claqLink = await headersValidation.claqLink.getText()
      await expect(claqLink).toMatch('Check air quality')
      await headersValidation.claqLink.click()
      // target location match page
      await expect(getStartPageHeaderText).toMatch(StartPageHeaderText)
      await startNowPage.startNowBtnClick()
      await locationSearchPage.clickESWRadiobtn()
      await locationSearchPage.setUserESWRegion(region)
      await locationSearchPage.clickContinueBtn()
      await headersValidation.claqLink.click()
      await expect(getStartPageHeaderText).toMatch(StartPageHeaderText)
      // target forecast main page
      await startNowPage.startNowBtnClick()
      await locationSearchPage.clickESWRadiobtn()
      await locationSearchPage.setUserESWRegion(region)
      await locationSearchPage.clickContinueBtn()
      await LocationMatchPage.firstLinkOfLocationMatch.click()
      await headersValidation.claqLink.click()
      await expect(getStartPageHeaderText).toMatch(StartPageHeaderText)
      await browser.deleteCookies()
      logger.info('--- HeadVal EndScenario CrownLink_CLAQ --------')
    })
    it('Beta-Banner', async () => {
      logger.info('--- HeadVal StartScenario Beta-Banner --------')
      await browser.deleteCookies()
      await browser.url('')
      await browser.maximizeWindow()
      // Handle the cookie banner
      if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
        await cookieBanner.rejectButtonCookiesDialog.click()
        await cookieBanner.hideButtonHideDialog.click()
      }
      const betaBannerText = await headersValidation.betaBanner.getText()
      await expect(betaBannerText).toMatch('Beta')
      const feedbackLink = await headersValidation.betaBannerFeedback.getText()
      await expect(feedbackLink).toMatch('feedback')
      const getFeedbackink =
        await headersValidation.betaBannerFeedback.getAttribute('href')
      // Commenting below because cdp not supporting navigation to 3rd party site for now
      // await headersValidation.betaBannerFeedback.click()
      // const browserURL = await browser.getUrl()
      // await browser.back()
      await expect(getFeedbackink).toMatch(
        'https://defragroup.eu.qualtrics.com/jfe/form/SV_dj4wJCoOkFQLXfM'
      )
      await browser.deleteCookies()
      logger.info('--- HeadVal EndScenario Beta-Banner --------')
    })
  })
})
