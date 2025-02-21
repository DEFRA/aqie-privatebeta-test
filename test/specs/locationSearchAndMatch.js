/* eslint-disable wdio/no-pause */
import { browser, expect } from '@wdio/globals'
import startNowPage from 'page-objects/startnowpage'
import locationSearchPage from 'page-objects/locationsearchpage'
import LocationMatchPage from 'page-objects/locationmatchpage'
import ForecastMainPage from 'page-objects/forecastmainpage'
import cookieBanner from 'page-objects/cookieBanner'
import errorPageLocationSearch from '../page-objects/errorPageLocationSearch.js'
import createLogger from 'helpers/logger'
import fs from 'node:fs'
const locationValue = JSON.parse(fs.readFileSync('test/testdata/regions.json'))
const singleRegion = JSON.parse(
  fs.readFileSync('test/testdata/singleRegion.json')
)
const nieswlocationValue = JSON.parse(
  fs.readFileSync('test/testdata/ni-esw-postalcode.json')
)
const niRegionsUnhappy = JSON.parse(
  fs.readFileSync('test/testdata/niRegionsUnhappy.json')
)
const regionsCaseSen = JSON.parse(
  fs.readFileSync('test/testdata/regionsCaseSen.json')
)
const postalcodeCaseSen = JSON.parse(
  fs.readFileSync('test/testdata/postalcodeCaseSen.json')
)

const logger = createLogger()

describe('Location Search', () => {
  locationValue.forEach(({ region }) => {
    it('Start Page', async () => {
      logger.info('--- LocSearch StartScenario Start LSMP Page --------')
      await browser.deleteCookies(['airaqie_cookie'])
      await browser.url('')
      await browser.maximizeWindow()
      // Handle the cookie banner
      if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
        await cookieBanner.rejectButtonCookiesDialog.click()
        await cookieBanner.hideButtonHideDialog.click()
      }
      const StartPageHeaderText = 'Check air quality'
      const getStartPageHeaderText =
        await startNowPage.startNowPageHeaderText.getText()
      await expect(getStartPageHeaderText).toMatch(StartPageHeaderText)
      await startNowPage.startNowBtnClick()
    })

    it('Location Search and Match Page', async () => {
      // Location Page
      const LocationHeaderText = 'Where do you want to check?'
      const locationESWSearchBoxText = 'Enter a location or postcode'
      const eswRadioBtnText = 'England, Scotland or Wales'
      const niRadioBtnText = 'Northern Ireland'
      const getLocationSearchHeaderText =
        await locationSearchPage.getLocationSearchHeader.getText()
      await expect(getLocationSearchHeaderText).toMatch(LocationHeaderText)

      const getEswRadioBtnText =
        await locationSearchPage.eswRadiobtnText.getText()
      await expect(getEswRadioBtnText).toMatch(eswRadioBtnText)
      const getNiRadioBtnText =
        await locationSearchPage.niRadiobtnText.getText()
      await expect(getNiRadioBtnText).toMatch(niRadioBtnText)
      await browser.pause(3000)
      await locationSearchPage.clickESWRadiobtn()

      const getESWLocationSearchBoxText =
        await locationSearchPage.eswLocationBoxText.getText()
      await expect(getESWLocationSearchBoxText).toMatch(
        locationESWSearchBoxText
      )
      await locationSearchPage.setUserESWRegion(region)
      await browser.pause(3000)
      await locationSearchPage.clickContinueBtn()
      // await browser.pause(3000)
      // Location Match Page
      await LocationMatchPage.clickOnMatchRegionLinks()
      await browser.deleteCookies(['airaqie_cookie'])
      logger.info('--- LocSearch EndScenario Start LSMP Page --------')
    })
  })
  it('Single Location- Two Lang(Eng-Wales)', async () => {
    logger.info(
      '--- LocSearch StartScenario Single Location- Two Lang(Eng-Wales) Page --------'
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
    await locationSearchPage.clickESWRadiobtn()
    await locationSearchPage.setUserESWRegion(singleRegion[1].region)
    await locationSearchPage.clickContinueBtn()
    const getForecastHeader =
      await ForecastMainPage.regionHeaderDisplay.getText()
    await expect(getForecastHeader).toMatch('Tenby, Sir Benfro - Pembrokeshire')
    await browser.deleteCookies(['airaqie_cookie'])
    logger.info(
      '--- LocSearch EndScenario Single Location- Two Lang(Eng-Wales) Page --------'
    )
  })
  nieswlocationValue.forEach(({ region }) => {
    it('NI Location Search', async () => {
      logger.info(
        '--- LocSearch StartScenario NI Location Search Page --------'
      )
      await browser.deleteCookies(['airaqie_cookie'])
      const locationNISearchBoxText = 'Enter a postcode'
      await browser.url('')
      await browser.maximizeWindow()
      // Handle the cookie banner
      if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
        await cookieBanner.rejectButtonCookiesDialog.click()
        await cookieBanner.hideButtonHideDialog.click()
      }
      await startNowPage.startNowBtnClick()
      await locationSearchPage.clickNIRadiobtn()
      const getNILocationSearchBoxText =
        await locationSearchPage.niLocationBoxText.getText()
      await expect(getNILocationSearchBoxText).toMatch(locationNISearchBoxText)
      await locationSearchPage.setUserNIRegion(region)
      await browser.pause(3000)
      await locationSearchPage.clickContinueBtn()
      // Location Match Page
      const getUserRegion = await ForecastMainPage.regionHeaderDisplay.getText()
      const getUserRegionSplit = getUserRegion.split(',')
      const regionToUppercaseText = region.toUpperCase()
      const regionRemoveSpace = regionToUppercaseText.replace(/\s+/, '')
      const addAirQualityTxt = 'Air quality in ' + regionRemoveSpace
      const receivedAreaOnly = getUserRegionSplit[0].replace(
        'Air quality in ',
        ''
      )
      const removeSpaceinReceivedAreaOnly = receivedAreaOnly.replace(/\s+/, '')
      const addBackAirQuality =
        'Air quality in ' + removeSpaceinReceivedAreaOnly
      await expect(addBackAirQuality).toMatch(addAirQualityTxt)
      await browser.deleteCookies(['airaqie_cookie'])
      logger.info('--- LocSearch EndScenario NI Location Search Page --------')
    })
  })

  niRegionsUnhappy.forEach(({ region }) => {
    it('NI Location Search-Unhappy', async () => {
      logger.info(
        '--- LocSearch StartScenario NI Location Search-Unhappy Page --------'
      )
      await browser.deleteCookies(['airaqie_cookie'])
      const locationNISearchBoxText = 'Enter a postcode'
      await browser.url('')
      await browser.maximizeWindow()
      // Handle the cookie banner
      if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
        await cookieBanner.rejectButtonCookiesDialog.click()
        await cookieBanner.hideButtonHideDialog.click()
      }
      await startNowPage.startNowBtnClick()
      await locationSearchPage.clickNIRadiobtn()
      const getNILocationSearchBoxText =
        await locationSearchPage.niLocationBoxText.getText()
      await expect(getNILocationSearchBoxText).toMatch(locationNISearchBoxText)
      await locationSearchPage.setUserNIRegion(region)
      await browser.pause(3000)
      await locationSearchPage.clickContinueBtn()
      // await browser.pause(3000)
      // Location Match Page
      const errorPageHeader =
        await errorPageLocationSearch.errorHeaderDisplay.getText()
      await expect(errorPageHeader).toMatch(
        'We could not find ' + "'" + region + "'"
      )
      await errorPageLocationSearch.clickSearchBackLink()
      await browser.deleteCookies(['airaqie_cookie'])
      logger.info(
        '--- LocSearch EndScenario NI Location Search-Unhappy Page --------'
      )
    })
  })

  regionsCaseSen.forEach(({ region }) => {
    it('region-case-sensitive location search', async () => {
      logger.info(
        '--- LocSearch StartScenario region-case-sensitive location search Page --------'
      )
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
      await startNowPage.startNowBtnClick()
      const locationESWSearchBoxText = 'Enter a location or postcode'
      await locationSearchPage.clickESWRadiobtn()

      const getESWLocationSearchBoxText =
        await locationSearchPage.eswLocationBoxText.getText()
      await expect(getESWLocationSearchBoxText).toMatch(
        locationESWSearchBoxText
      )
      await locationSearchPage.setUserESWRegion(region)
      await browser.pause(3000)
      await locationSearchPage.clickContinueBtn()

      const getLocationMatchHeaderText =
        await LocationMatchPage.headerTextMatch.getText()
      await expect(getLocationMatchHeaderText).toMatch(
        'Locations matching ' + "'" + region + "'"
      )
      await LocationMatchPage.clickSearchBackLink()
      await browser.deleteCookies(['airaqie_cookie'])
      logger.info(
        '--- LocSearch EndScenario region-case-sensitive location search Page --------'
      )
    })
  })
  postalcodeCaseSen.forEach(({ region }) => {
    it('postal-code-sensitive location search', async () => {
      logger.info(
        '--- LocSearch StartScenario postal-code-sensitive location search Page --------'
      )
      await browser.deleteCookies(['airaqie_cookie'])
      const locationESWSearchBoxText = 'Enter a location or postcode'
      await browser.url('/search-location')
      await browser.maximizeWindow()
      await browser.url('')
      await browser.maximizeWindow()
      // Handle the cookie banner
      if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
        await cookieBanner.rejectButtonCookiesDialog.click()
        await cookieBanner.hideButtonHideDialog.click()
      }
      await startNowPage.startNowBtnClick()
      // Location-block
      await locationSearchPage.clickESWRadiobtn()
      const getESWLocationSearchBoxText =
        await locationSearchPage.eswLocationBoxText.getText()
      await expect(getESWLocationSearchBoxText).toMatch(
        locationESWSearchBoxText
      )
      await locationSearchPage.setUserESWRegion(region)
      await browser.pause(3000)
      await locationSearchPage.clickContinueBtn()
      const getUserRegion = await ForecastMainPage.regionHeaderDisplay.getText()
      const getUserRegionSplit = getUserRegion.split(',')
      const getUserRegionSplitNoSpace = getUserRegionSplit[0]
        .toString()
        .replace(/\s+/g, '')
      const regionToUppercaseText = region.toUpperCase()
      const regionRemoveSpace = regionToUppercaseText.replace(/\s+/, '')
      const addAirQualityTxt = 'Airqualityin' + regionRemoveSpace
      const addAirQualityTxtString = addAirQualityTxt.toString()
      expect(getUserRegionSplitNoSpace).toMatch(
        addAirQualityTxtString.replace(/\s+/g, '')
      )
      await browser.deleteCookies(['airaqie_cookie'])
      logger.info(
        '--- LocSearch EndScenario postal-code-sensitive location search Page --------'
      )
    })
  })
})
