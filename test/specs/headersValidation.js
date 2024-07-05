import passwordPageLogin from './passwordPageLogin'
import headersValidation from 'page-objects/headersObject'
import startNowPage from 'page-objects/startnowpage'
import locationSearchPage from 'page-objects/locationsearchpage'
import LocationMatchPage from 'page-objects/locationmatchpage'
import createLogger from 'helpers/logger'
import fs from 'node:fs'
const locationMatchRegion = JSON.parse(
  fs.readFileSync('test/testdata/locationMatchRegion.json')
)
const logger = createLogger()
locationMatchRegion.forEach(({ region }) => {
  describe('Headers Validation', () => {
    it('CrownLink_CLAQ', async () => {
      logger.info('--- HeadVal StartScenario CrownLink_CLAQ --------')
      await passwordPageLogin.passwordPageLogin()
      const govukLink = await headersValidation.govUKCrownLink.getText()
      await expect(govukLink.split(' ').pop()).toMatch('GOV.UK')
      await headersValidation.govUKCrownLink.click()
      const browserURL = await browser.getUrl()
      await expect(browserURL).toMatch('https://www.gov.uk/')
      await browser.back()
      const StartPageHeaderText = 'Check local air quality'
      const getStartPageHeaderText =
        await startNowPage.startNowPageHeaderText.getText()
      await expect(getStartPageHeaderText).toMatch(StartPageHeaderText)
      await startNowPage.startNowBtnClick()
      const claqLink = await headersValidation.claqLink.getText()
      await expect(claqLink).toMatch('Check local air quality')
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
      await passwordPageLogin.passwordPageLogin()
      const betaBannerText = await headersValidation.betaBanner.getText()
      await expect(betaBannerText).toMatch('Beta')
      const feedbackLink = await headersValidation.betaBannerFeedback.getText()
      await expect(feedbackLink).toMatch('feedback')
      await headersValidation.betaBannerFeedback.click()
      const browserURL = await browser.getUrl()
      await expect(browserURL).toMatch(
        'https://defragroup.eu.qualtrics.com/jfe/form/SV_dj4wJCoOkFQLXfM'
      )
      await browser.back()
      await browser.deleteCookies()
      logger.info('--- HeadVal EndScenario Beta-Banner --------')
    })
  })
})
