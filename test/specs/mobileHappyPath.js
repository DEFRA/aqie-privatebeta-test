import startNowPage from '../page-objects/startnowpage.js'
import locationSearchPage from '../page-objects/locationsearchpage.js'
import LocationMatchPage from '../page-objects/locationmatchpage.js'
import ForecastMainPage from '../page-objects/forecastmainpage.js'
import cookieBanner from '../page-objects/cookieBanner.js'
import relatedContentPage from '../page-objects/relatedContentPage.js'
import alertsSmsPage from '../page-objects/alertsSmsPage.js'
import alertsEmailPage from '../page-objects/alertsEmailPage.js'
import { browser } from '@wdio/globals'
import fs from 'node:fs'
import createLogger from '../helpers/logger.js'

const dynlocationValue = JSON.parse(
  fs.readFileSync('test/testdata/dynamicForecast.json')
)
const logger = createLogger()

// Real BrowserStack devices reach the internal CDP environment over the
// BrowserStack Local tunnel and are much slower than local Chrome emulation,
// so page/element waits need a more generous timeout to avoid false "not
// displayed" failures. Locally elements appear quickly, so this only adds a
// longer ceiling - it does not slow the local run down.
const MOBILE_TIMEOUT = 30000

// Capture exactly where we are stuck so the console output itself reveals why
// navigation did not happen on the device (wrong page / validation error /
// still on the search page), instead of needing to pull artifacts.
async function logStuckDiagnostics(label) {
  const url = await browser.getUrl().catch(() => 'unknown')
  const diag = await browser
    .execute(() => {
      const h1 = document.querySelector('h1')
      const errorSummary = document.querySelector('.govuk-error-summary__title')
      const errorList = document.querySelector('.govuk-error-summary__list')
      return {
        title: document.title,
        firstH1: h1 ? h1.textContent.trim() : '(no h1)',
        errorTitle: errorSummary ? errorSummary.textContent.trim() : null,
        errorText: errorList
          ? errorList.textContent.replace(/\s+/g, ' ').trim()
          : null
      }
    })
    .catch(() => ({}))
  logger.error(
    `[${label}] Stuck after Continue. URL=${url} | title=${diag.title} | h1=${diag.firstH1} | errorTitle=${diag.errorTitle} | errorText=${diag.errorText}`
  )
}

// Robustly move from the "Continue" click to the forecast page. On a slow real
// device (BrowserStack) the next page often has not loaded yet at the moment we
// check, so checking the match list immediately can wrongly skip it and then
// wait forever for a heading that is not there. Instead, wait for EITHER the
// location match list OR the forecast heading to appear, click the first match
// if a match list was returned, then wait for the forecast heading.
//
// The tap on the radio label and the typed location value can intermittently
// fail to register on a real touch device, leaving the form invalid so Continue
// just re-renders /search-location with a validation error and never navigates.
// We detect that bounce-back and re-submit the search a few times before giving
// up, so a single missed tap no longer fails the whole test.
async function openForecastAfterContinue(region, ni) {
  const MAX_SUBMIT_ATTEMPTS = 3

  const reachedNextPage = async () =>
    browser
      .waitUntil(
        async () => {
          const onMatchList =
            await LocationMatchPage.headerTextMatch.isExisting()
          const onForecast = await ForecastMainPage.regionHeaderDisplay
            .isDisplayed()
            .catch(() => false)
          return onMatchList || onForecast
        },
        { timeout: MOBILE_TIMEOUT }
      )
      .then(() => true)
      .catch(() => false)

  let navigated = await reachedNextPage()

  for (
    let attempt = 1;
    !navigated && attempt < MAX_SUBMIT_ATTEMPTS;
    attempt++
  ) {
    // Still on the search page (or nowhere useful) - the previous submit did
    // not take. Log why, then re-fill the form and resubmit.
    await logStuckDiagnostics('openForecastAfterContinue')
    const stillOnSearch = (await browser.getUrl().catch(() => '')).includes(
      '/search-location'
    )
    if (!stillOnSearch || region === undefined) break
    logger.warn(
      `[openForecastAfterContinue] Re-submitting search (attempt ${
        attempt + 1
      }/${MAX_SUBMIT_ATTEMPTS})`
    )
    await selectLocationAndContinue(region, ni)
    navigated = await reachedNextPage()
  }

  if (!navigated) {
    await logStuckDiagnostics('openForecastAfterContinue')
    throw new Error(
      'Neither the location match list nor the forecast page appeared after Continue'
    )
  }

  if (await LocationMatchPage.headerTextMatch.isExisting()) {
    await LocationMatchPage.firstLinkOfLocationMatch.click()
  }
  await ForecastMainPage.regionHeaderDisplay.waitForDisplayed({
    timeout: MOBILE_TIMEOUT,
    timeoutMsg: 'Forecast page heading did not appear'
  })
}

// Select the location-type radio, enter the location, and submit. On a real
// touch device the radio LABEL tap can fail to actually check the radio, which
// leaves the form invalid so Continue just reloads /search-location. We verify
// the radio is selected (falling back to clicking the input element), verify
// the typed value landed, and scroll Continue into view before submitting.
// Type the location into the box and confirm it actually landed. On a real
// touch device a single setValue can be swallowed (focus/keyboard timing), so
// we re-type until getValue reflects what we asked for, rather than submitting
// an empty box that bounces straight back to /search-location.
async function setLocationValue(box, region) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    await box.setValue(region)
    const landed = (await box.getValue().catch(() => '')).trim()
    if (landed === region) return
    logger.warn(
      `[search] Location value not retained (got "${landed}", want "${region}"); retrying (${attempt}/3)`
    )
  }
}

async function selectLocationAndContinue(region, ni) {
  if (ni === 'Yes') {
    await locationSearchPage.clickNIRadiobtn()
    const niRadio = await $('#locationType-2')
    if (!(await niRadio.isSelected().catch(() => false))) {
      await niRadio.click().catch(() => {})
    }
    await locationSearchPage.locationNIBox.waitForDisplayed({
      timeout: MOBILE_TIMEOUT
    })
    await setLocationValue(locationSearchPage.locationNIBox, region)
    logger.info(
      `[search] NI radio selected=${await niRadio.isSelected()}, value="${await locationSearchPage.locationNIBox.getValue()}"`
    )
  } else {
    await locationSearchPage.clickESWRadiobtn()
    const eswRadio = await $('#locationType')
    if (!(await eswRadio.isSelected().catch(() => false))) {
      await eswRadio.click().catch(() => {})
    }
    await locationSearchPage.locationESWBox.waitForDisplayed({
      timeout: MOBILE_TIMEOUT
    })
    await setLocationValue(locationSearchPage.locationESWBox, region)
    logger.info(
      `[search] ESW radio selected=${await eswRadio.isSelected()}, value="${await locationSearchPage.locationESWBox.getValue()}"`
    )
  }
  await locationSearchPage.continueBtn.scrollIntoView()
  await locationSearchPage.continueBtn.waitForClickable({
    timeout: MOBILE_TIMEOUT
  })
  await locationSearchPage.clickContinueBtn()
}

dynlocationValue.forEach(({ region, nearestRegionForecast, NI }) => {
  describe(`Browser Stack Mobile Test - ${region}`, () => {
    it('Mobile test validation', async () => {
      logger.info('--- MobileTestValidation StartScenario --------')

      // Initialize browser and handle cookies - delete ALL cookies to ensure clean state
      await browser.deleteCookies()

      // Navigate to homepage with explicit wait for page load
      await browser.url('')
      await browser.waitUntil(
        async () =>
          await browser.execute(() => document.readyState === 'complete'),
        { timeout: MOBILE_TIMEOUT, timeoutMsg: 'Page did not load completely' }
      )

      // Handle the cookie banner - wait for it to appear
      await cookieBanner.cookieBannerDialog.waitForDisplayed({
        timeout: MOBILE_TIMEOUT
      })
      await cookieBanner.rejectButtonCookiesDialog.waitForClickable({
        timeout: MOBILE_TIMEOUT
      })
      await cookieBanner.rejectButtonCookiesDialog.click()
      await cookieBanner.hideButtonHideDialog.click()

      // Navigate to forecast page (robust radio selection + submit)
      await startNowPage.startNowBtnClick()
      await selectLocationAndContinue(region, NI)

      // Move to the forecast page (handles the location match list + slow
      // real-device navigation timing, and re-submits if Continue bounced back).
      await openForecastAfterContinue(region, NI)

      // The DAQI 5-day forecast is a govuk-tabs component. On the stacked
      // (mobile-emulation) layout the panels are shown and the tab strip is
      // hidden; on the tabbed (real-device) layout only the active panel shows
      // and the other days sit behind tabs you tap to view. The full day name
      // is held in each day tab's aria-label, which is present in the DOM in
      // both layouts - so we read that rather than the layout-dependent,
      // possibly-hidden panel headings.
      const dayTabs = await ForecastMainPage.daqiForecastDayTabs
      await browser.waitUntil(async () => (await dayTabs.length) > 0, {
        timeout: MOBILE_TIMEOUT,
        timeoutMsg: 'Mobile forecast days did not appear'
      })

      const daqiDaysTextMobile = []
      for (const dayTab of dayTabs) {
        const dayName = await dayTab.getAttribute('aria-label')
        daqiDaysTextMobile.push(dayName)
      }

      // Fetch the next 4 days starting from tomorrow (full weekday names)
      const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ]
      const today = new Date()
      const todayIndex = today.getDay()
      const next4Days = []

      for (let i = 1; i <= 4; i++) {
        const futureIndex = (todayIndex + i) % days.length
        next4Days.push(days[futureIndex])
      }

      // Use only the next 4 days as expected
      const expectedDays = next4Days
      logger.info(
        `[MobileDAQI] Day tab labels; page=${JSON.stringify(
          daqiDaysTextMobile
        )}, expected=${JSON.stringify(expectedDays)}`
      )

      // Compare the result with daqiDaysTextMobile
      await expect(daqiDaysTextMobile).toMatchObject(expectedDays)
      await browser.deleteCookies(['airaqie_cookie'])
      logger.info('--- MobileTestValidation EndScenario --------')
    })
  })
})

describe('Browser Stack Mobile Test - Related content', () => {
  it('Related content header and the 3 links navigate and return', async () => {
    logger.info('--- MobileRelatedContent StartScenario --------')
    const searchLocation = 'Gloucester'

    await browser.deleteCookies()
    await browser.url('')
    await browser.waitUntil(
      async () =>
        await browser.execute(() => document.readyState === 'complete'),
      { timeout: MOBILE_TIMEOUT, timeoutMsg: 'Page did not load completely' }
    )

    // Handle the cookie banner
    await cookieBanner.cookieBannerDialog.waitForDisplayed({
      timeout: MOBILE_TIMEOUT
    })
    await cookieBanner.rejectButtonCookiesDialog.waitForClickable({
      timeout: MOBILE_TIMEOUT
    })
    await cookieBanner.rejectButtonCookiesDialog.click()
    await cookieBanner.hideButtonHideDialog.click()

    // Navigate to the location forecast page (robust radio selection + submit)
    await startNowPage.startNowBtnClick()
    await selectLocationAndContinue(searchLocation, 'No')
    await openForecastAfterContinue(searchLocation, 'No')

    // Save the place name dynamically from the "Air quality in <place>" heading
    const locationHeader = await relatedContentPage.locationPageHeader.getText()
    const placeName = locationHeader.replace(/^Air quality in\s*/i, '').trim()
    logger.info(`--- MobileRelatedContent place name: "${placeName}" --------`)
    const backLinkText = 'Air pollution in ' + placeName

    // Related content section header (displayed at the bottom of the page)
    await relatedContentPage.relatedContentHeader.scrollIntoView()
    await expect(
      await relatedContentPage.relatedContentHeader.getText()
    ).toMatch('Related content')

    // Link 1 - "Health effects of air pollution"
    await relatedContentPage.clickHealthEffectsLink()
    await expect(await relatedContentPage.pageHeader.getText()).toMatch(
      'Health effects of air pollution'
    )
    await expect(
      await relatedContentPage.backToLocationLink(placeName).getText()
    ).toMatch(backLinkText)
    await relatedContentPage.clickBackToLocation(placeName)
    await expect(await relatedContentPage.locationPageHeader.getText()).toMatch(
      'Air quality in ' + placeName
    )

    // Link 2 - "Actions to reduce your exposure to air pollution"
    await relatedContentPage.relatedContentHeader.scrollIntoView()
    await relatedContentPage.clickActionsReduceExposureLink()
    await expect(await relatedContentPage.pageHeader.getText()).toMatch(
      'Actions you can take to reduce your exposure to air pollution'
    )
    await expect(
      await relatedContentPage.backToLocationLink(placeName).getText()
    ).toMatch(backLinkText)
    await relatedContentPage.clickBackToLocation(placeName)
    await expect(await relatedContentPage.locationPageHeader.getText()).toMatch(
      'Air quality in ' + placeName
    )

    // Link 3 - "Air pollution breaches"
    await relatedContentPage.relatedContentHeader.scrollIntoView()
    await relatedContentPage.clickAirPollutionBreachesLink()
    await expect(await relatedContentPage.pageHeader.getText()).toMatch(
      'Air pollution breaches'
    )
    await expect(
      await relatedContentPage.backToLocationLink(placeName).getText()
    ).toMatch(backLinkText)
    await relatedContentPage.clickBackToLocation(placeName)
    await expect(await relatedContentPage.locationPageHeader.getText()).toMatch(
      'Air quality in ' + placeName
    )

    await browser.deleteCookies(['airaqie_cookie'])
    logger.info('--- MobileRelatedContent EndScenario --------')
  })
})

describe('Browser Stack Mobile Test - Air quality alerts section', () => {
  it('Alerts section header and the SMS/email links redirect correctly', async () => {
    logger.info('--- MobileAlertsSection StartScenario --------')
    const searchLocation = 'Gloucester'

    await browser.deleteCookies()
    await browser.url('')
    await browser.waitUntil(
      async () =>
        await browser.execute(() => document.readyState === 'complete'),
      { timeout: MOBILE_TIMEOUT, timeoutMsg: 'Page did not load completely' }
    )

    // Handle the cookie banner
    await cookieBanner.cookieBannerDialog.waitForDisplayed({
      timeout: MOBILE_TIMEOUT
    })
    await cookieBanner.rejectButtonCookiesDialog.waitForClickable({
      timeout: MOBILE_TIMEOUT
    })
    await cookieBanner.rejectButtonCookiesDialog.click()
    await cookieBanner.hideButtonHideDialog.click()

    // Navigate to the location forecast page (robust radio selection + submit)
    await startNowPage.startNowBtnClick()
    await selectLocationAndContinue(searchLocation, 'No')
    await openForecastAfterContinue(searchLocation, 'No')

    // Assert the "Air quality alerts by text message or email" section header
    await alertsSmsPage.alertsSectionHeader.scrollIntoView()
    await expect(await alertsSmsPage.alertsSectionHeader.getText()).toMatch(
      'Air quality alerts by text message or email'
    )

    // Link 1 - "Get alerts by text message" redirects to the SMS page
    await alertsSmsPage.clickGetAlertsByTextLink()
    await expect(browser).toHaveUrl(
      expect.stringContaining('/notify/register/sms-mobile-number')
    )
    await expect(await alertsSmsPage.smsPageHeader.getText()).toMatch(
      'What is your mobile phone number?'
    )
    // Go back to the location page to validate the second link
    await browser.back()
    await ForecastMainPage.regionHeaderDisplay.waitForDisplayed({
      timeout: MOBILE_TIMEOUT
    })

    // Link 2 - "Get alerts by email" redirects to the email details page
    await alertsEmailPage.alertsSectionHeader.scrollIntoView()
    await alertsEmailPage.clickGetAlertsByEmailLink()
    await expect(browser).toHaveUrl(
      expect.stringContaining('/notify/register/email-details')
    )
    await expect(await alertsEmailPage.emailPageHeader.getText()).toMatch(
      'What is your email address?'
    )

    await browser.deleteCookies(['airaqie_cookie'])
    logger.info('--- MobileAlertsSection EndScenario --------')
  })
})
