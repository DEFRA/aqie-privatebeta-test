import footerObjects from 'page-objects/footer'
import startNowPage from 'page-objects/startnowpage'
import locationSearchPage from 'page-objects/locationsearchpage'
import LocationMatchPage from 'page-objects/locationmatchpage'
import ForecastMainPage from 'page-objects/forecastmainpage'
import cookiePage from 'page-objects/cookiePage'
import cookieBanner from 'page-objects/cookieBanner'
import errorPageLocationSearch from '../page-objects/errorPageLocationSearch.js'
import createLogger from 'helpers/logger'
import { browser, expect } from '@wdio/globals'
import fs from 'node:fs'
const locationMatchRegion = JSON.parse(
  fs.readFileSync('test/testdata/locationMatchRegion.json')
)
const logger = createLogger()
describe('Footer Validations', () => {
  it('Footer-Cookie', async () => {
    logger.info('--- FooVal StartScenario Footer-Cookie --------')
    await browser.deleteCookies(['airaqie_cookie'])
    await browser.url('')
    await browser.maximizeWindow()
    // Handle the cookie banner
    if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
      await cookieBanner.rejectButtonCookiesDialog.click()
      await cookieBanner.hideButtonHideDialog.click()
    }
    try {
      await footerObjects.cookieFooterLink.scrollIntoView()
    } catch (error) {
      logger.info('ERRORINSCROLLINTOVIEW')
      logger.error(error)
    }

    const getCookieFooterLinkText =
      await footerObjects.cookieFooterLink.getText()
    await expect(getCookieFooterLinkText).toMatch('Cookies')
    await footerObjects.cookieFooterLink.click()
    const cookiePageURL = await browser.getUrl()
    const expectedCookieURL = '/cookies'
    const getCookieURLParts = '/' + cookiePageURL.split('/').pop()
    await expect(getCookieURLParts).toMatch(expectedCookieURL)
    const headerCookiePage = await cookiePage.cookiePageHeader.getText()
    // cookie page validations
    await expect(headerCookiePage).toMatch('Cookies')
    // back to local air quality page link
    const localAirQualityLink =
      await cookiePage.CookiePageToLAQPageLink.getText()
    await expect(localAirQualityLink).toMatch('Check air quality')
    await cookiePage.CookiePageToLAQPageLink.click()
    const StartPageHeaderText = 'Check air quality'
    const getStartPageHeaderText =
      await startNowPage.startNowPageHeaderText.getText()
    await expect(getStartPageHeaderText).toMatch(StartPageHeaderText)
    try {
      await footerObjects.cookieFooterLink.scrollIntoView()
    } catch (error) {
      logger.error(error)
    }

    await footerObjects.cookieFooterLink.click()

    // reject cookies and save
    try {
      await cookiePage.rejectRadioButton.scrollIntoView()
    } catch (error) {
      logger.error(error)
    }

    await cookiePage.rejectRadioButton.click()
    await cookiePage.saveCookieSettings.click()
    try {
      await cookiePage.decisionHeaderBanner.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      })
    } catch (error) {
      logger.error(error)
    }

    const decisionBanner = await cookiePage.decisionHeaderBanner.getText()
    await expect(decisionBanner).toMatch('Success')
    // Validate _ga cookie not comes until user accepts
    const allCookies = await browser.getCookies()
    let setGAValue = 'false'
    for (let i = 0; i < allCookies.length; i++) {
      if (
        allCookies[i].name === '_ga' ||
        allCookies[i].name === '_gid' ||
        allCookies[i].name === '_gat_UA-[G-8CMZBTDQBC]'
      ) {
        setGAValue = 'true'
        logger.error('Google Analytics cookie logged - Not Expected')
        await expect(setGAValue).toMatch('false')
      } else {
        logger.info(`Reject - logged cookies  ${allCookies[i].name}`)
      }
    }
    await browser.refresh()
    const airaqieCookiesAnalytics = await browser.getCookies([
      'airaqie_cookies_analytics'
    ])
    await expect(airaqieCookiesAnalytics[0].value).toMatch('false')

    // Next click on the footer for the check for accept cookies
    try {
      await footerObjects.cookieFooterLink.scrollIntoView()
    } catch (error) {
      logger.error(error)
    }

    await footerObjects.cookieFooterLink.click()
    try {
      await cookiePage.acceptRadioButton.scrollIntoView()
    } catch (error) {
      logger.error(error)
    }

    await cookiePage.acceptRadioButton.click()
    await cookiePage.saveCookieSettings.click()
    try {
      await cookiePage.decisionHeaderBanner.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      })
    } catch (error) {
      logger.error(error)
    }

    const decisionBanner1 = await cookiePage.decisionHeaderBanner.getText()
    await expect(decisionBanner1).toMatch('Success')
    await browser.back()
    await browser.refresh()
    const airaqieCookiesAnalytics1 = await browser.getCookies([
      'airaqie_cookies_analytics'
    ])
    await expect(airaqieCookiesAnalytics1[0].value).toMatch('true')
    const StartPageHeaderText1 = 'Check air quality'
    const getStartPageHeaderText1 =
      await startNowPage.startNowPageHeaderText.getText()
    await expect(getStartPageHeaderText1).toMatch(StartPageHeaderText1)
    await browser.deleteCookies(['airaqie_cookie'])
    logger.info('--- FooVal EndScenario Footer-Cookie --------')
  })
  it('OGL-Open Government License', async () => {
    logger.info('--- FooVal StartScenario OGL-Open Government License --------')
    await browser.deleteCookies(['airaqie_cookie'])
    await browser.url('')
    await browser.maximizeWindow()
    // Handle the cookie banner
    if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
      await cookieBanner.rejectButtonCookiesDialog.click()
      await cookieBanner.hideButtonHideDialog.click()
    }
    try {
      await footerObjects.oglFooterLink.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      })
    } catch (error) {
      logger.info('scrollIntoViewError')
      logger.error(error)
    }
    const getOGLText = await footerObjects.oglFooterLink.getText()
    await expect(getOGLText).toMatch('Open Government Licence v3.0')
    const getHrefOgl = await footerObjects.oglFooterLink.getAttribute('href')
    const expectedOGLURL =
      'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'
    await expect(getHrefOgl).toMatch(expectedOGLURL)
    await browser.deleteCookies(['airaqie_cookie'])
    logger.info('--- FooVal EndScenario OGL-Open Government License --------')
  })
  it('Footer-Crown-Logo', async () => {
    logger.info('--- FooVal StartScenario Footer-Crown-Logo --------')
    await browser.deleteCookies(['airaqie_cookie'])
    await browser.url('')
    await browser.maximizeWindow()
    // Handle the cookie banner
    if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
      await cookieBanner.rejectButtonCookiesDialog.click()
      await cookieBanner.hideButtonHideDialog.click()
    }
    await footerObjects.logoFooter.scrollIntoView()
    const getHeaderOfCookieBanner = await footerObjects.logoFooter.getText()
    await expect(getHeaderOfCookieBanner).toMatch('© Crown copyright')

    const expectedLogoURL =
      'https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/'
    const getHrefLogo = await footerObjects.logoFooter.getAttribute('href')
    await expect(getHrefLogo).toMatch(expectedLogoURL)
    await browser.deleteCookies(['airaqie_cookie'])
    logger.info('--- FooVal EndScenario Footer-Crown-Logo --------')
  })
  it('Footer-Privacy', async () => {
    logger.info('--- FooVal StartScenario Footer-Privacy --------')
    await browser.deleteCookies(['airaqie_cookie'])
    await browser.url('')
    await browser.maximizeWindow()
    // Handle the cookie banner
    if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
      await cookieBanner.rejectButtonCookiesDialog.click()
      await cookieBanner.hideButtonHideDialog.click()
    }
    await footerObjects.privacyFooterLink.scrollIntoView()
    const getCookieFooterLinkText =
      await footerObjects.privacyFooterLink.getText()
    await expect(getCookieFooterLinkText).toMatch('Privacy')
    await footerObjects.privacyFooterLink.click()
    const privacyPageURL = await browser.getUrl()
    const expectedPrivacyURL = '/privacy'
    const getCookieURLParts = '/' + privacyPageURL.split('/').pop()
    await expect(getCookieURLParts).toMatch(expectedPrivacyURL)
    await browser.back()
    const StartPageHeaderText = 'Check air quality'
    const getStartPageHeaderText =
      await startNowPage.startNowPageHeaderText.getText()
    await expect(getStartPageHeaderText).toMatch(StartPageHeaderText)
    await browser.deleteCookies(['airaqie_cookie'])
    logger.info('--- FooVal EndScenario Footer-Privacy --------')
  })
  it('Footer-Accessibility statement', async () => {
    logger.info(
      '--- FooVal StartScenario Footer-Accessibility statement --------'
    )
    await browser.deleteCookies(['airaqie_cookie'])
    await browser.url('')
    await browser.maximizeWindow()
    // Handle the cookie banner
    if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
      await cookieBanner.rejectButtonCookiesDialog.click()
      await cookieBanner.hideButtonHideDialog.click()
    }
    await footerObjects.AccStmtFooterLink.scrollIntoView()
    const getAccStmtFooterLinkText =
      await footerObjects.AccStmtFooterLink.getText()
    await expect(getAccStmtFooterLinkText).toMatch('Accessibility statement')
    await footerObjects.AccStmtFooterLink.click()
    const AccStmtPageURL = await browser.getUrl()
    const expectedAccStmtURL = '/accessibility'
    const getAccStmtURLParts = '/' + AccStmtPageURL.split('/').pop()
    await expect(getAccStmtURLParts).toMatch(expectedAccStmtURL)
    await browser.back()
    const StartPageHeaderText = 'Check air quality'
    const getStartPageHeaderText =
      await startNowPage.startNowPageHeaderText.getText()
    await expect(getStartPageHeaderText).toMatch(StartPageHeaderText)
    await browser.deleteCookies(['airaqie_cookie'])
    logger.info(
      '--- FooVal EndScenario Footer-Accessibility statement --------'
    )
  })
  locationMatchRegion.forEach(({ region }) => {
    it('Footer-Links_In-All-Pages', async () => {
      logger.info('--- FooVal StartScenario Footer-Links_In-All-Pages --------')
      await browser.deleteCookies(['airaqie_cookie'])
      const expectedCookieURL = '/cookies'
      const expectedOGLURL =
        'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'
      const expectedLogoURL =
        'https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/'
      const expectedPrivacyURL = '/privacy'
      const expectedAccStatementURL = '/accessibility'
      await browser.url('')
      await browser.maximizeWindow()
      // Handle the cookie banner
      if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
        await cookieBanner.rejectButtonCookiesDialog.click()
        await cookieBanner.hideButtonHideDialog.click()
      }
      // Start Now Page
      const StartPageHeaderText = 'Check air quality'
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
      await locationSearchPage.continueBtn.click()
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
      await expect(getUKSummaryTitle).toMatch('UK forecast')
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
      await browser.deleteCookies()
      logger.info('--- FooVal EndScenario Footer-Links_In-All-Pages --------')
    })
  })
})
