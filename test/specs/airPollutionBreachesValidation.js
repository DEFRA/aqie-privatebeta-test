/* eslint-disable wdio/no-pause */
import { browser, expect, $ } from '@wdio/globals'
import startNowPage from '../page-objects/startnowpage.js'
import locationSearchPage from '../page-objects/locationsearchpage.js'
import breachesPage from '../page-objects/breachesPage.js'
import cookieBanner from '../page-objects/cookieBanner.js'
import createLogger from '../helpers/logger.js'
import {
  getActiveBreachCount,
  getPastBreachCount
} from '../helpers/aqsrAlertsApi.js'

const logger = createLogger()

const searchLocation = 'Wales'
const matchLocation = 'Welshpool Mid Wales Airport, Powys - Powys'

describe('Air pollution breaches - Active and Past breaches', () => {
  it('Active breaches count matches the AQSR API and Past breaches is shown', async () => {
    logger.info('--- Breaches StartScenario air pollution breaches --------')

    // Step 9 - resolve the dynamic active breach count from the AQSR API first
    // (so it is available for the "Active breaches" assertion in step 8)
    const apiActiveBreachCount = await getActiveBreachCount()
    logger.info(`[Breaches] API active breach count = ${apiActiveBreachCount}`)

    // Past breaches expected count from the AQSR API (last 12 months minus the
    // last 24 hours items) - used for the "Recorded in the last 12 months" list
    const apiPastBreachCount = await getPastBreachCount()
    logger.info(`[Breaches] API past breach count = ${apiPastBreachCount}`)

    await browser.deleteCookies(['airaqie_cookie'])
    await browser.url('')
    await browser.maximizeWindow()
    // Handle the cookie banner
    if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
      await cookieBanner.rejectButtonCookiesDialog.click()
      await cookieBanner.hideButtonHideDialog.click()
    }

    // Step 2 - Start now
    await startNowPage.startNowBtnClick()

    // Step 3 - England, Scotland or Wales radio button
    await locationSearchPage.clickESWRadiobtn()

    // Step 4 - Search "Wales" and choose the matching location
    await locationSearchPage.setUserESWRegion(searchLocation)
    await browser.pause(3000)
    await locationSearchPage.clickContinueBtn()
    const matchLink = await $('=' + matchLocation)
    await matchLink.click()

    // Step 5 - Landing page has the alerts section
    await expect(await breachesPage.locationPageHeader.getText()).toMatch(
      'Air quality in'
    )
    await expect(await breachesPage.alertsSectionHeader.getText()).toMatch(
      'Air quality alerts'
    )

    // Step 6 - Right side pane "Related content"
    await expect(await breachesPage.relatedContentHeader.getText()).toMatch(
      'Related content'
    )

    // Step 7 - Click "Air pollution breaches" and assert the page header
    await breachesPage.clickAirPollutionBreachesLink()
    await expect(await breachesPage.breachesPageHeader.getText()).toMatch(
      'Air pollution breaches'
    )

    // Step 8 - Validate the "Active breaches" header and the dynamic count that
    // comes from the AQSR API logic (step 9)
    await expect(await breachesPage.activeBreachesHeader.getText()).toMatch(
      'Active breaches'
    )
    const uiActiveBreachCount = await breachesPage.activeBreachesCount.getText()
    logger.info(`[Breaches] UI active breach count = ${uiActiveBreachCount}`)
    await expect(uiActiveBreachCount).toEqual(String(apiActiveBreachCount))
    await expect(await breachesPage.activeBreachesText.getText()).toMatch(
      'There is currently ' +
        apiActiveBreachCount +
        ' active air pollution breach'
    )

    // Step 10 - Validate the "Past breaches" header
    await expect(await breachesPage.pastBreachesHeader.getText()).toMatch(
      'Past breaches'
    )

    // Validate the "Recorded in the last 12 months" list. Collect every
    // accordion entry (e.g. "Honiton, South West (27 May 2026)") and assert the
    // total count equals the AQSR API past breach count (12 months - last 24h).
    await expect(
      await breachesPage.recordedLast12MonthsHeader.getText()
    ).toMatch('Recorded in the last 12 months')

    const pastSections = await breachesPage.pastBreachesSections
    const recordedBreaches = []
    for (const section of pastSections) {
      const sectionText = (await section.getText()).trim()
      recordedBreaches.push(sectionText)
    }
    logger.info(
      `[Breaches] Recorded in the last 12 months - UI list count = ${recordedBreaches.length}`
    )
    logger.info(
      `[Breaches] Recorded in the last 12 months - UI list = ${JSON.stringify(
        recordedBreaches
      )}`
    )
    await expect(recordedBreaches.length).toEqual(apiPastBreachCount)

    await browser.deleteCookies(['airaqie_cookie'])
    logger.info('--- Breaches EndScenario air pollution breaches --------')
  })
})
