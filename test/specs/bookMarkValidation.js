import cookieBanner from 'page-objects/cookieBanner'
import ForecastMainPage from 'page-objects/forecastmainpage'
import errorPageLocationSearch from 'page-objects/errorPageLocationSearch.js'
import createLogger from 'helpers/logger'
import fs from 'node:fs'
const bookMarkUrlData = JSON.parse(
  fs.readFileSync('test/testdata/bookMark.json')
)
const logger = createLogger()
describe('Bookmark Validation', () => {
  for (const bookMarkUrl of bookMarkUrlData) {
    const { region, headerRegionText, happyFlow } = bookMarkUrl
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
      if (happyFlow === 'Yes') {
        const getForecastHeader =
          await ForecastMainPage.regionHeaderDisplay.getText()
        await expect(getForecastHeader).toMatch(headerRegionText)
      } else if (happyFlow === 'No') {
        const errorPageHeader =
          await errorPageLocationSearch.errorHeaderDisplay.getText()
        await expect(errorPageHeader).toMatch(headerRegionText)
      }
      await browser.deleteCookies()
      logger.info('--- bookmark EndScenario--------')
    })
  }
})
