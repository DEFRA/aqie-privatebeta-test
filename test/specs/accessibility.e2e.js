/* eslint-disable wdio/no-pause */
/* global before, after */
import {
  initialiseAccessibilityChecking,
  analyseAccessibility,
  generateAccessibilityReports,
  generateAccessibilityReportIndex
} from '../../accessibility-checking.js'
import startNowPage from '../page-objects/startnowpage.js'
import locationSearchPage from '../page-objects/locationsearchpage.js'
import LocationMatchPage from '../page-objects/locationmatchpage.js'
import relatedContentPage from '../page-objects/relatedContentPage.js'
import cookieBanner from '../page-objects/cookieBanner.js'

// Location used to reach a forecast page that carries the "Related content" pane.
const searchLocation = 'GL43YX'

/**
 * Navigates from the home page through search to a location (forecast) page,
 * which is where the pollutant and "Related content" links live. Mirrors the
 * flow in relatedContentValidation.js / staticpagepollutants.js.
 */
async function goToLocationPage() {
  await browser.deleteCookies(['airaqie_cookie'])
  await browser.url('')
  await browser.maximizeWindow()
  if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
    await cookieBanner.rejectButtonCookiesDialog.click()
    await cookieBanner.hideButtonHideDialog.click()
  }
  await startNowPage.startNowBtnClick()
  await locationSearchPage.clickESWRadiobtn()
  await locationSearchPage.setUserESWRegion(searchLocation)
  await browser.pause(3000)
  await locationSearchPage.clickContinueBtn()
  // A multi-match search shows a "location match" list first; a single match
  // goes straight to the forecast page. Click the first match only if present.
  if (await LocationMatchPage.headerTextMatch.isExisting()) {
    await LocationMatchPage.firstLinkOfLocationMatch.click()
  }
  await waitForPageLoad()
}

/**
 * Helper function to wait for page to be fully loaded
 */
async function waitForPageLoad() {
  await browser.waitUntil(
    async () => {
      const readyState = await browser.execute(() => document.readyState)
      return readyState === 'complete'
    },
    {
      timeout: 10000,
      timeoutMsg: 'Page did not load completely'
    }
  )
}

/**
 * Dismisses the cookie banner (reject + hide) if it is displayed, so it does
 * not overlay the page during the accessibility scan. Safe to call on any page.
 */
async function dismissCookieBanner() {
  if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
    await cookieBanner.rejectButtonCookiesDialog.click()
    await cookieBanner.hideButtonHideDialog.click()
  }
}

describe('Accessibility Testing', () => {
  before(async () => {
    await initialiseAccessibilityChecking()
  })

  it('should test home page accessibility', async () => {
    await browser.url('/')
    await waitForPageLoad()
    await dismissCookieBanner()
    await analyseAccessibility('home-page')
  })

  it('should test search results accessibility', async () => {
    await browser.url('/search-location')
    await waitForPageLoad()
    await dismissCookieBanner()
    await locationSearchPage.clickESWRadiobtn()
    await locationSearchPage.setUserESWRegion(searchLocation)
    await browser.pause(3000)
    await locationSearchPage.clickContinueBtn()
    await waitForPageLoad()
    await analyseAccessibility('search-results') // scans the results page
  })

  it('should test search location page accessibility', async () => {
    await browser.url('/search-location')
    await waitForPageLoad()
    await dismissCookieBanner()
    await analyseAccessibility('search-location')
  })

  it('should test cookies page accessibility', async () => {
    await browser.url('/cookies')
    await waitForPageLoad()
    await dismissCookieBanner()
    await analyseAccessibility('cookies')
  })

  it('should test privacy page accessibility', async () => {
    await browser.url('/privacy')
    await waitForPageLoad()
    await dismissCookieBanner()
    await analyseAccessibility('privacy')
  })

  it('should test accessibility statement page accessibility', async () => {
    await browser.url('/accessibility')
    await waitForPageLoad()
    await dismissCookieBanner()
    await analyseAccessibility('accessibility-statement')
  })

  it('should test health effects page accessibility', async () => {
    await browser.url('/health-effects')
    await waitForPageLoad()
    await dismissCookieBanner()
    await analyseAccessibility('health-effects')
  })

  // Pollutant pages are reached by searching a location and clicking through to
  // the forecast page, then clicking the pollutant link. goToLocationPage()
  // performs the full search flow and lands on the forecast page.
  it('should test ozone pollutant page accessibility', async () => {
    await goToLocationPage()
    await $('=Ozone').click()
    await waitForPageLoad()
    await analyseAccessibility('ozone')
  })

  it('should test nitrogen dioxide pollutant page accessibility', async () => {
    await goToLocationPage()
    await $('=Nitrogen dioxide').click()
    await waitForPageLoad()
    await analyseAccessibility('no2')
  })

  it('should test sulphur dioxide pollutant page accessibility', async () => {
    await goToLocationPage()
    await $('=Sulphur dioxide').click()
    await waitForPageLoad()
    await analyseAccessibility('so2')
  })

  it('should test PM2.5 pollutant page accessibility', async () => {
    await goToLocationPage()
    await $('=PM2.5').click()
    await waitForPageLoad()
    await analyseAccessibility('pm25')
  })

  it('should test PM10 pollutant page accessibility', async () => {
    await goToLocationPage()
    await $('=PM10').click()
    await waitForPageLoad()
    await analyseAccessibility('pm10')
  })

  it('should test health effects related content page accessibility', async () => {
    await goToLocationPage()
    await relatedContentPage.clickHealthEffectsLink()
    await waitForPageLoad()
    await analyseAccessibility('health-effects-of-air-pollution')
  })

  it('should test actions to reduce exposure page accessibility', async () => {
    await goToLocationPage()
    await relatedContentPage.clickActionsReduceExposureLink()
    await waitForPageLoad()
    await analyseAccessibility('actions-reduce-exposure')
  })

  it('should test air pollution breaches page accessibility', async () => {
    await goToLocationPage()
    await relatedContentPage.clickAirPollutionBreachesLink()
    await waitForPageLoad()
    await analyseAccessibility('air-pollution-breaches')
  })

  after(async () => {
    await generateAccessibilityReports('accessibility-tests')
    generateAccessibilityReportIndex()
  })
})
