/* eslint-disable wdio/no-pause */
import { browser, expect } from '@wdio/globals'
import startNowPage from 'page-objects/startnowpage'
import locationSearchPage from 'page-objects/locationsearchpage'
import LocationMatchPage from 'page-objects/locationmatchpage'
import ForecastMainPage from 'page-objects/forecastmainpage'
import passwordPageLogin from './passwordPageLogin'
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
      logger.info('Test Suite locationSearchAndMatch started')
      // password-block
      await passwordPageLogin.passwordPageLogin()
      const StartPageHeaderText = 'Check local air quality'
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
      await browser.deleteCookies(['airaqie-cookie'])
    })
  })
  it('Single Location- Two Lang(Eng-Wales)', async () => {
    await passwordPageLogin.passwordPageLogin()
    await startNowPage.startNowBtnClick()
    await locationSearchPage.clickESWRadiobtn()
    await locationSearchPage.setUserESWRegion(singleRegion[1].region)
    await locationSearchPage.clickContinueBtn()
    const getForecastHeader =
      await ForecastMainPage.regionHeaderDisplay.getText()
    await expect(getForecastHeader).toMatch('Tenby, Sir Benfro - Pembrokeshire')
    await browser.deleteCookies(['airaqie-cookie'])
  })
  nieswlocationValue.forEach(({ region }) => {
    it('NI Location Search', async () => {
      const locationNISearchBoxText = 'Enter a postcode'
      await passwordPageLogin.passwordPageLogin()
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
      expect(getUserRegionSplit[0].replace(/\s+/, '')).toMatch(
        regionToUppercaseText.replace(/\s+/, '')
      )
      await browser.deleteCookies(['airaqie-cookie'])
    })
  })

  niRegionsUnhappy.forEach(({ region }) => {
    it('NI Location Search-Unhappy', async () => {
      const locationNISearchBoxText = 'Enter a postcode'
      await passwordPageLogin.passwordPageLogin()
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
      await browser.deleteCookies(['airaqie-cookie'])
    })
  })

  regionsCaseSen.forEach(({ region }) => {
    it('region-case-sensitive location search', async () => {
      await browser.url('/search-location')
      await browser.maximizeWindow()
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
      await browser.pause(3000)
      await locationSearchPage.clickContinueBtn()

      const getLocationMatchHeaderText =
        await LocationMatchPage.headerTextMatch.getText()
      await expect(getLocationMatchHeaderText).toMatch(
        'Locations matching ' + "'" + region + "'"
      )
      await LocationMatchPage.clickSearchBackLink()
      await browser.deleteCookies(['airaqie-cookie'])
    })
  })
  postalcodeCaseSen.forEach(({ region }) => {
    it('postal-code-sensitive location search', async () => {
      const locationESWSearchBoxText = 'Enter a location or postcode'
      await browser.url('/search-location')
      await browser.maximizeWindow()
      // password-block
      await passwordPageLogin.passwordPageLogin()
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
      const regionToUppercaseText = region.toUpperCase()
      expect(getUserRegionSplit[0].replace(/\s+/, '')).toMatch(
        regionToUppercaseText.replace(/\s+/, '')
      )
      await browser.deleteCookies(['airaqie-cookie'])
    })
  })
})
