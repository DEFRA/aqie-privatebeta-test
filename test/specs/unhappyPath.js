import locationSearchPage from '../page-objects/locationsearchpage.js'
import errorPageLocationSearch from '../page-objects/errorPageLocationSearch.js'
import startNowPage from '../page-objects/startnowpage.js'
import passwordPageLogin from './passwordPageLogin.js'
import { browser, expect } from '@wdio/globals'
import fs from 'node:fs'
import createLogger from 'helpers/logger'
const locationValue = JSON.parse(
  fs.readFileSync('test/testdata/regionsUnhappy.json')
)
const logger = createLogger()

describe('AQIE-unhappyPath', () => {
  it('Location Empty Search', async () => {
    logger.info('--- AQIEUnhap StartScenario Location Empty Search--------')
    await browser.url('/search-location')
    await browser.maximizeWindow()
    // password-block
    await passwordPageLogin.passwordPageLogin()
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
    await browser.deleteCookies(['airaqie-cookie'])
    logger.info('--- AQIEUnhap EndScenario Location Empty Search--------')
  })
  locationValue.forEach(({ region }) => {
    it('invalid page search-invalid postcode & special characters', async () => {
      logger.info(
        '--- AQIEUnhap StartScenario invalid page search-invalid postcode & special characters--------'
      )
      // password-block
      await passwordPageLogin.passwordPageLogin()
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
      await expect(errorPageHeader).toMatch(
        'We could not find ' + "'" + region + "'"
      )
      await errorPageLocationSearch.clickSearchBackLink()
      await browser.deleteCookies(['airaqie-cookie'])
      logger.info(
        '--- AQIEUnhap EndScenario invalid page search-invalid postcode & special characters--------'
      )
    })
  })
})
