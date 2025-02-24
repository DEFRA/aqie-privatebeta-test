import cookieBanner from 'page-objects/cookieBanner'
import ForecastMainPage from 'page-objects/forecastmainpage'
import createLogger from 'helpers/logger'
import fs from 'node:fs'
const bookMarkUrlData = JSON.parse(
  fs.readFileSync('test/testdata/bookMark.json')
)
const logger = createLogger()
describe('Bookmark Validation', () => {
  for (const bookMarkUrl of bookMarkUrlData) {
    const { region, headerRegionText } = bookMarkUrl
    it(`Bookmark for ${region}`, async () => {
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
  }
})
