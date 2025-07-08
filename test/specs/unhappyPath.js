import locationSearchPage from '../page-objects/locationsearchpage.js'
import errorPageLocationSearch from '../page-objects/errorPageLocationSearch.js'
import startNowPage from '../page-objects/startnowpage.js'
import cookieBanner from '../page-objects/cookieBanner.js'
import { browser, expect } from '@wdio/globals'
import fs from 'node:fs'
import createLogger from '../helpers/logger.js'
const locationValue = JSON.parse(
  fs.readFileSync('test/testdata/regionsUnhappy.json')
)
const logger = createLogger()
// Function to capitalize the first letter and lowercase the rest
const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

describe('AQIE-unhappyPath', () => {
  it('Location Empty Search', async () => {
    logger.info('--- AQIEUnhap StartScenario Location Empty Search--------')
    await browser.deleteCookies(['airaqie_cookie'])
    await browser.url('/search-location')
    await browser.maximizeWindow()
    await browser.url('')
    await browser.maximizeWindow()
    // Handle the cookie banner
    if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
      await cookieBanner.rejectButtonCookiesDialog.click()
      await cookieBanner.hideButtonHideDialog.click()
    }
    // startnow-block
    await startNowPage.startNowBtnClick()
    // location-block
    const LocationHeaderText = 'Where do you want to check?'
    const errorSubTextValidation = 'Select where you want to check'
    const errorESWSubTextValidation = 'Enter a location or postcode'
    const errorNISubTextValidation = 'Enter a postcode'
    const errorColorHexValue = '#d4351c' // red
    const getLocationSearchHeaderText =
      await locationSearchPage.getLocationSearchHeader.getText()
    await expect(getLocationSearchHeaderText).toMatch(LocationHeaderText)
    await locationSearchPage.clickContinueBtn()
    const getErrorMessageNoChoice =
      await locationSearchPage.errorMessageNoChoice.getText()
    await expect(getErrorMessageNoChoice).toMatch(errorSubTextValidation)
    const colorErrorText =
      await locationSearchPage.colorLocationSearchBoxText.getCSSProperty(
        'color'
      )
    await expect(colorErrorText.parsed.hex).toMatch(errorColorHexValue)

    await locationSearchPage.clickESWRadiobtn()
    await locationSearchPage.clickContinueBtn()
    const getESWLocationSearchBoxText =
      await locationSearchPage.emptyBoxValidationESW.getText()
    await expect(getESWLocationSearchBoxText).toMatch(errorESWSubTextValidation)

    await locationSearchPage.clickNIRadiobtn()
    await locationSearchPage.clickContinueBtn()
    const getNILocationSearchBoxText =
      await locationSearchPage.emptyBoxValidationNI.getText()
    await expect(getNILocationSearchBoxText).toMatch(errorNISubTextValidation)
    await browser.deleteCookies(['airaqie_cookie'])
    logger.info('--- AQIEUnhap EndScenario Location Empty Search--------')
  })

  for (const location of locationValue) {
    const { region } = location
    it(`invalid page search-invalid postcode ${region}`, async () => {
      logger.info(
        '--- AQIEUnhap StartScenario invalid page search-invalid postcode & special characters--------'
      )
      await browser.deleteCookies(['airaqie_cookie'])
      await browser.url('')
      await browser.maximizeWindow()
      // Handle the cookie banner
      if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
        await cookieBanner.rejectButtonCookiesDialog.click()
        await cookieBanner.hideButtonHideDialog.click()
      }
      await startNowPage.startNowBtnClick()
      const locationESWSearchBoxText = 'Enter a location or postcode'
      await locationSearchPage.clickESWRadiobtn()
      const getESWLocationSearchBoxText =
        await locationSearchPage.eswLocationBoxText.getText()
      await expect(getESWLocationSearchBoxText).toMatch(
        locationESWSearchBoxText
      )
      await locationSearchPage.setUserESWRegion(region)
      await locationSearchPage.clickContinueBtn()
      const errorPageHeader =
        await errorPageLocationSearch.errorHeaderDisplay.getText()
      const transformedRegion = capitalizeFirstLetter(region)
      await expect(errorPageHeader).toMatch(
        'We could not find ' + "'" + transformedRegion + "'"
      )
      await errorPageLocationSearch.clickSearchBackLink()
      await browser.deleteCookies(['airaqie_cookie'])
      logger.info(
        '--- AQIEUnhap EndScenario invalid page search-invalid postcode & special characters--------'
      )
    })
    it(`invalid URL route`, async () => {
      logger.info('--- AQIEUnhap StartScenario invalid URL route--------')
      await browser.deleteCookies(['airaqie_cookie'])
      await browser.url('')
      await browser.maximizeWindow()
      // Handle the cookie banner
      if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
        await cookieBanner.rejectButtonCookiesDialog.click()
        await cookieBanner.hideButtonHideDialog.click()
      }
      await startNowPage.startNowBtnClick()
      // invalid path added hyphen 1
      await browser.url('/search-location-1?lang=en')
      // await browser.pause(2000)
      const getErrorPageHeaderText =
        await errorPageLocationSearch.welshErrorHeaderDisplay.getText()
      const airQualityTeamMailTo =
        await errorPageLocationSearch.airQualityTeamMailTo.getText()
      await expect(getErrorPageHeaderText).toMatch('Page not found')
      await expect(airQualityTeamMailTo).toMatch('air quality team')
      // Click on the header to go back to home page
      await errorPageLocationSearch.clickBackToHomePage()
      // Here as disccused with BA and dev welsh translation will move to English due to invalid page route
      // Above mentioned issue corrected and on redirection it sticks to same language
      const StartPageHeaderText = 'Check air quality'
      const getStartPageHeaderText =
        await startNowPage.welshStartNowPageHeaderText.getText()
      await expect(getStartPageHeaderText).toMatch(StartPageHeaderText)
      await browser.deleteCookies(['airaqie_cookie'])
      logger.info('--- AQIEUnhap EndScenario invalid URL route--------')
    })
  }
})
