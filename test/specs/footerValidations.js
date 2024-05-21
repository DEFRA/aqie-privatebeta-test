/* eslint-disable prettier/prettier */
import footerObjects from 'page-objects/footer'
import startNowPage from 'page-objects/startnowpage'
import passwordPageLogin from './passwordPageLogin'
import locationSearchPage from 'page-objects/locationsearchpage'
import LocationMatchPage from 'page-objects/locationmatchpage'
import ForecastMainPage from 'page-objects/forecastmainpage'
import errorPageLocationSearch from '../page-objects/errorPageLocationSearch.js'
import createLogger from 'helpers/logger'
import { browser, expect } from '@wdio/globals'
import fs from 'node:fs'
const locationMatchRegion = JSON.parse(
  fs.readFileSync('test/testdata/locationMatchRegion.json')
)
const logger = createLogger()
describe('Footer Validations', () => {
  it('Cookie-Footer', async () => {
    logger.info('Test Suite ::::: Cookie-Footer')
    await browser.url('')
    await browser.maximizeWindow()
    // password-block
    await passwordPageLogin.passwordPageLogin()
    await footerObjects.cookieFooterLink.scrollIntoView()
    const getCookieFooterLinkText =
      await footerObjects.cookieFooterLink.getText()
    await expect(getCookieFooterLinkText).toMatch('Cookies')
    await footerObjects.cookieFooterLink.click()
    const cookiePageURL = await browser.getUrl()
    const expectedCookieURL = 'https://www.gov.uk/help/cookies'
    await expect(cookiePageURL).toMatch(expectedCookieURL)
    await browser.back()
    const StartPageHeaderText = 'Check local air quality'
    const getStartPageHeaderText =
      await startNowPage.startNowPageHeaderText.getText()
    await expect(getStartPageHeaderText).toMatch(StartPageHeaderText)
    await browser.deleteCookies(['airaqie-cookie'])
  })
  it('OGL-Open Government License', async () => {
    logger.info('Test Suite ::::: OGL')
    await browser.url('')
    await browser.maximizeWindow()
    // password-block
    await passwordPageLogin.passwordPageLogin()
    await footerObjects.oglFooterLink.scrollIntoView()
    const getOGLText = await footerObjects.oglFooterLink.getText()
    await expect(getOGLText).toMatch('Open Government Licence v3.0')
    await footerObjects.oglFooterLink.click()
    const oglPageURL = await browser.getUrl()
    const expectedOGLURL =
      'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'
    await expect(oglPageURL).toMatch(expectedOGLURL)
    await browser.back()
    const StartPageHeaderText = 'Check local air quality'
    const getStartPageHeaderText =
      await startNowPage.startNowPageHeaderText.getText()
    await expect(getStartPageHeaderText).toMatch(StartPageHeaderText)
    await browser.deleteCookies(['airaqie-cookie'])
  })
  it('Crown-Logo', async () => {
    logger.info('Test Suite ::::: Crown-Logo')
    await browser.url('')
    await browser.maximizeWindow()
    // password-block
    await passwordPageLogin.passwordPageLogin()
    await footerObjects.logoFooter.scrollIntoView()
    const getHeaderOfCookieBanner = await footerObjects.logoFooter.getText()
    await expect(getHeaderOfCookieBanner).toMatch('© Crown copyright')
    await footerObjects.logoFooter.click()
    const logoPageURL = await browser.getUrl()
    const expectedLogoURL =
      'https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/'
    await expect(logoPageURL).toMatch(expectedLogoURL)
    await browser.back()
    const StartPageHeaderText = 'Check local air quality'
    const getStartPageHeaderText =
      await startNowPage.startNowPageHeaderText.getText()
    await expect(getStartPageHeaderText).toMatch(StartPageHeaderText)
    await browser.deleteCookies(['airaqie-cookie'])
  })
  locationMatchRegion.forEach(({ region }) => {
    it('Footer-Links_In-All-Pages', async () => {
      logger.info('Test Suite ::::: Footer-Links_In-All-Pages')
      const expectedCookieURL = 'https://www.gov.uk/help/cookies'
      const expectedOGLURL =
        'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'
      const expectedLogoURL =
        'https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/'
      const expectedPrivacyURL = 'https://www.gov.uk/help/privacy-notice'
      const expectedAccStatementURL =
        'https://www.gov.uk/help/accessibility-statement'
      await browser.url('')
      await browser.maximizeWindow()
      // password-block
      await passwordPageLogin.passwordPageLogin()
      // Start Now Page
      const StartPageHeaderText = 'Check local air quality'
      const getStartPageHeaderText =
        await startNowPage.startNowPageHeaderText.getText()
      await expect(getStartPageHeaderText).toMatch(StartPageHeaderText)
      await footerObjects.privacyFooterLink.scrollIntoView()
      const getHrefCookies =
        await footerObjects.cookieFooterLink.getAttribute('href')
      const getHrefOgl = await footerObjects.oglFooterLink.getAttribute('href')
      const getHrefLogo = await footerObjects.logoFooter.getAttribute('href')
      const getHrefPrivacy =
        await footerObjects.privacyFooterLink.getAttribute('href')
      const getHrefAccStatementURL =
        await footerObjects.AccStmtFooterLink.getAttribute('href')
      await expect(getHrefCookies).toMatch(expectedCookieURL)
      await expect(getHrefOgl).toMatch(expectedOGLURL)
      await expect(getHrefLogo).toMatch(expectedLogoURL)
      await expect(getHrefPrivacy).toMatch(expectedPrivacyURL)
      await expect(getHrefAccStatementURL).toMatch(expectedAccStatementURL)
      await startNowPage.startNowBtnClick()
      // Location-Search page
      const LocationHeaderText = 'Where do you want to check?'
      const getLocationSearchHeaderText =
        await locationSearchPage.getLocationSearchHeader.getText()
      await expect(getLocationSearchHeaderText).toMatch(LocationHeaderText)
      await locationSearchPage.clickESWRadiobtn()
      await locationSearchPage.setUserESWRegion(region)
      await footerObjects.privacyFooterLink.scrollIntoView()
      const getHrefCookies1 =
        await footerObjects.cookieFooterLink.getAttribute('href')
      const getHrefOgl1 = await footerObjects.oglFooterLink.getAttribute('href')
      const getHrefLogo1 = await footerObjects.logoFooter.getAttribute('href')
      const getHrefPrivacy1 =
        await footerObjects.privacyFooterLink.getAttribute('href')
      const getHrefAccStatementURL1 =
        await footerObjects.AccStmtFooterLink.getAttribute('href')
      await expect(getHrefCookies1).toMatch(expectedCookieURL)
      await expect(getHrefOgl1).toMatch(expectedOGLURL)
      await expect(getHrefLogo1).toMatch(expectedLogoURL)
      await expect(getHrefPrivacy1).toMatch(expectedPrivacyURL)
      await expect(getHrefAccStatementURL1).toMatch(expectedAccStatementURL)
      await locationSearchPage.clickContinueBtn()
      // Location-Match page
      const getLocationMatchHeaderText =
        await LocationMatchPage.headerTextMatch.getText()
      await expect(getLocationMatchHeaderText).toMatch(
        'Locations matching ' + "'" + region + "'"
      )
      await footerObjects.privacyFooterLink.scrollIntoView()
      const getHrefCookies2 =
        await footerObjects.cookieFooterLink.getAttribute('href')
      const getHrefOgl2 = await footerObjects.oglFooterLink.getAttribute('href')
      const getHrefLogo2 = await footerObjects.logoFooter.getAttribute('href')
      const getHrefPrivacy2 =
        await footerObjects.privacyFooterLink.getAttribute('href')
      const getHrefAccStatementURL2 =
        await footerObjects.AccStmtFooterLink.getAttribute('href')
      await expect(getHrefCookies2).toMatch(expectedCookieURL)
      await expect(getHrefOgl2).toMatch(expectedOGLURL)
      await expect(getHrefLogo2).toMatch(expectedLogoURL)
      await expect(getHrefPrivacy2).toMatch(expectedPrivacyURL)
      await expect(getHrefAccStatementURL2).toMatch(expectedAccStatementURL)
      await LocationMatchPage.firstLinkOfLocationMatch.click()
      // forecast main page
      await ForecastMainPage.pollutantsUKSummaryLinks.scrollIntoView()
      const getUKSummaryTitle =
        await ForecastMainPage.pollutantsUKSummaryLinks.getText()
      await expect(getUKSummaryTitle).toMatch('UK air pollution summary')
      await footerObjects.privacyFooterLink.scrollIntoView()
      const getHrefCookies3 =
        await footerObjects.cookieFooterLink.getAttribute('href')
      const getHrefOgl3 = await footerObjects.oglFooterLink.getAttribute('href')
      const getHrefLogo3 = await footerObjects.logoFooter.getAttribute('href')
      const getHrefPrivacy3 =
        await footerObjects.privacyFooterLink.getAttribute('href')
      const getHrefAccStatementURL3 =
        await footerObjects.AccStmtFooterLink.getAttribute('href')
      await expect(getHrefCookies3).toMatch(expectedCookieURL)
      await expect(getHrefOgl3).toMatch(expectedOGLURL)
      await expect(getHrefLogo3).toMatch(expectedLogoURL)
      await expect(getHrefPrivacy3).toMatch(expectedPrivacyURL)
      await expect(getHrefAccStatementURL3).toMatch(expectedAccStatementURL)
      // click on the changeLocation Link for error page
      await ForecastMainPage.changeLocationLink.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      })
      await ForecastMainPage.changeLocationLink.click()
      await locationSearchPage.clickNIRadiobtn()
      await locationSearchPage.setUserNIRegion('@#$%')
      await locationSearchPage.clickContinueBtn()
      const searchBackLink =
        await errorPageLocationSearch.searchBackLink.getText()
      await expect(searchBackLink).toMatch('Go back to search a location')
      await footerObjects.privacyFooterLink.scrollIntoView()
      const getHrefCookies4 =
        await footerObjects.cookieFooterLink.getAttribute('href')
      const getHrefOgl4 = await footerObjects.oglFooterLink.getAttribute('href')
      const getHrefLogo4 = await footerObjects.logoFooter.getAttribute('href')
      const getHrefPrivacy4 =
        await footerObjects.privacyFooterLink.getAttribute('href')
      const getHrefAccStatementURL4 =
        await footerObjects.AccStmtFooterLink.getAttribute('href')
      await expect(getHrefCookies4).toMatch(expectedCookieURL)
      await expect(getHrefOgl4).toMatch(expectedOGLURL)
      await expect(getHrefLogo4).toMatch(expectedLogoURL)
      await expect(getHrefPrivacy4).toMatch(expectedPrivacyURL)
      await expect(getHrefAccStatementURL4).toMatch(expectedAccStatementURL)
    })
  })
})
