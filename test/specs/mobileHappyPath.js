import startNowPage from '../page-objects/startnowpage.js'
import locationSearchPage from '../page-objects/locationsearchpage.js'
import LocationMatchPage from '../page-objects/locationmatchpage.js'
import cookieBanner from '../page-objects/cookieBanner.js'
import { browser } from '@wdio/globals'
import fs from 'node:fs'
import createLogger from '../helpers/logger.js'

const dynlocationValue = JSON.parse(
  fs.readFileSync('test/testdata/dynamicForecast.json')
)
const logger = createLogger()

dynlocationValue.forEach(({ region, nearestRegionForecast, NI }) => {
  describe(`Forecast Main Page - ${region}`, () => {
    it('daqi value-direct search', async () => {
      logger.info('--- FMP StartScenario daqi value-direct search --------')

      // Initialize browser and handle cookies
      await browser.deleteCookies(['airaqie_cookie'])
      // await browser.url('')
      await browser.url('')
      await browser.maximizeWindow()

      // Handle the cookie banner
      if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
        await cookieBanner.rejectButtonCookiesDialog.click()
        await cookieBanner.hideButtonHideDialog.click()
      }

      // Navigate to forecast page
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
    })
  })
})
