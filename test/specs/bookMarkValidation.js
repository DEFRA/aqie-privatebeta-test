import cookieBanner from 'page-objects/cookieBanner'
import ForecastMainPage from 'page-objects/forecastmainpage'
import createLogger from 'helpers/logger'
import fs from 'node:fs'
const bookMarkUrl = JSON.parse(fs.readFileSync('test/testdata/bookMark.json'))
const logger = createLogger()
bookMarkUrl.forEach(({ region, headerRegionText }) => {
  describe('Bookmark Validation', () => {
    it('bookmark', async () => {
      logger.info('--- bookmark StartScenario--------')
      await browser.deleteCookies()
      await browser.url(region)
      await browser.maximizeWindow()
      // Handle the cookie banner
      if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
        await cookieBanner.rejectButtonCookiesDialog.click()
        await cookieBanner.hideButtonHideDialog.click()
      }
      const getForecastHeader =
        await ForecastMainPage.regionHeaderDisplay.getText()
      await expect(getForecastHeader).toMatch(headerRegionText)
      await browser.deleteCookies()
      logger.info('--- bookmark EndScenario--------')
    })
  })
})
