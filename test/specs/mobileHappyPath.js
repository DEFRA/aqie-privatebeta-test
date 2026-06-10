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

// Robustly move from the "Continue" click to the forecast page. On a slow real
// device (BrowserStack) the next page often has not loaded yet at the moment we
// check, so checking the match list immediately can wrongly skip it and then
// wait forever for a heading that is not there. Instead, wait for EITHER the
// location match list OR the forecast heading to appear, click the first match
// if a match list was returned, then wait for the forecast heading.
async function openForecastAfterContinue() {
  await browser.waitUntil(
    async () => {
      const onMatchList = await LocationMatchPage.headerTextMatch.isExisting()
      const onForecast = await ForecastMainPage.regionHeaderDisplay
        .isDisplayed()
        .catch(() => false)
      return onMatchList || onForecast
    },
    {
      timeout: MOBILE_TIMEOUT,
      timeoutMsg:
        'Neither the location match list nor the forecast page appeared after Continue'
    }
  )
  if (await LocationMatchPage.headerTextMatch.isExisting()) {
    await LocationMatchPage.firstLinkOfLocationMatch.click()
  }
  await ForecastMainPage.regionHeaderDisplay.waitForDisplayed({
    timeout: MOBILE_TIMEOUT,
    timeoutMsg: 'Forecast page heading did not appear'
  })
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

      // Navigate to forecast page
      await startNowPage.startNowBtnClick()
      if (NI === 'No') {
        await locationSearchPage.clickESWRadiobtn()
        await locationSearchPage.setUserESWRegion(region)
      } else if (NI === 'Yes') {
        await locationSearchPage.clickNIRadiobtn()
        await locationSearchPage.setUserNIRegion(region)
      }

      // Add an explicit wait for the continue button to be clickable
      await locationSearchPage.continueBtn.waitForClickable({
        timeout: MOBILE_TIMEOUT
      })
      // Check if continue button is displayed and enabled before clicking
      const isDisplayed = await locationSearchPage.continueBtn.isDisplayed()
      const isEnabled = await locationSearchPage.continueBtn.isEnabled()
      logger.info(
        `Continue button displayed: ${isDisplayed}, enabled: ${isEnabled}`
      )
      if (!isDisplayed) {
        throw new Error('Continue button is not displayed')
      }
      if (!isEnabled) {
        throw new Error('Continue button is not enabled')
      }
      // Click on the body to dismiss the mobile keyboard
      await browser.execute(() => {
        document.body.click()
      })
      await locationSearchPage.clickContinueBtn()

      // Move to the forecast page (handles the location match list + slow
      // real-device navigation timing).
      await openForecastAfterContinue()

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

    // Navigate to the location forecast page
    await startNowPage.startNowBtnClick()
    await locationSearchPage.clickESWRadiobtn()
    await locationSearchPage.setUserESWRegion(searchLocation)
    await locationSearchPage.continueBtn.waitForClickable({
      timeout: MOBILE_TIMEOUT
    })
    // Click on the body to dismiss the mobile keyboard
    await browser.execute(() => {
      document.body.click()
    })
    await locationSearchPage.clickContinueBtn()
    await openForecastAfterContinue()

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

    // Navigate to the location forecast page
    await startNowPage.startNowBtnClick()
    await locationSearchPage.clickESWRadiobtn()
    await locationSearchPage.setUserESWRegion(searchLocation)
    await locationSearchPage.continueBtn.waitForClickable({
      timeout: MOBILE_TIMEOUT
    })
    // Click on the body to dismiss the mobile keyboard
    await browser.execute(() => {
      document.body.click()
    })
    await locationSearchPage.clickContinueBtn()
    await openForecastAfterContinue()

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
