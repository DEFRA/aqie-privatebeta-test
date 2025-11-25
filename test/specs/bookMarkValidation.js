import { browser, expect } from '@wdio/globals'
import cookieBanner from '../page-objects/cookieBanner.js'
import ForecastMainPage from '../page-objects/forecastmainpage.js'
import errorPageLocationSearch from '../page-objects/errorPageLocationSearch.js'
import locationSearchPage from '../page-objects/locationsearchpage.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import createLogger from '../helpers/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const bookMarkUrlData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../test/testdata/bookMark.json'))
)
const logger = createLogger()

describe('Bookmark Validation', () => {
  for (const bookMarkUrl of bookMarkUrlData) {
    const { region, headerRegionText, happyFlow, language } = bookMarkUrl
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
        if (language === 'English') {
          // Click Welsh Toogle button
          await locationSearchPage.linkButtonWelsh.click()
          const welshChangeSearchLocation =
            await ForecastMainPage.changeLocationLink.getText()
          await expect(welshChangeSearchLocation).toMatch('Newid lleoliad')
        } else if (language === 'Welsh') {
          // Click English Toogle button
          await locationSearchPage.linkButtonEnglish.click()
          const getAirPollutantTitle =
            await ForecastMainPage.daqiOfCurrentDaysHeader.getText()
          await expect(getAirPollutantTitle).toMatch(
            'Predicted air pollution levels'
          )
        }
      } else if (happyFlow === 'No') {
        const errorPageHeader =
          await errorPageLocationSearch.welshErrorHeaderDisplay.getText()
        await expect(errorPageHeader).toMatch(headerRegionText)
      }
      await browser.deleteCookies()
      logger.info('--- bookmark EndScenario--------')
    })
  }
})
