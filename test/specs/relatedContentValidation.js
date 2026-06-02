/* eslint-disable wdio/no-pause */
import { browser, expect, $ } from '@wdio/globals'
import startNowPage from '../page-objects/startnowpage.js'
import locationSearchPage from '../page-objects/locationsearchpage.js'
import relatedContentPage from '../page-objects/relatedContentPage.js'
import cookieBanner from '../page-objects/cookieBanner.js'
import createLogger from '../helpers/logger.js'

const logger = createLogger()

const searchLocation = 'Wales'
const matchLocation = 'Welshpool Mid Wales Airport, Powys - Powys'

describe('Related content - location page right side pane', () => {
  it('Related content links navigate and return to the location page', async () => {
    logger.info('--- RelatedContent StartScenario related content links -----')
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

    // Step 5 - Landing page has the alerts section. We also derive the place
    // name dynamically from the "Air quality in <place>" heading so that the
    // back-link assertions work for whatever location the user searched.
    const locationHeader = await relatedContentPage.locationPageHeader.getText()
    const placeName = locationHeader.replace(/^Air quality in\s*/i, '').trim()
    logger.info(`--- RelatedContent saved place name: "${placeName}" --------`)
    await expect(
      await relatedContentPage.alertsSectionHeader.getText()
    ).toMatch('Air quality alerts')

    // Step 6 - Right side pane "Related content"
    await expect(
      await relatedContentPage.relatedContentHeader.getText()
    ).toMatch('Related content')

    const backLinkText = 'Air pollution in ' + placeName

    // Step 6.1 - "Health effects of air pollution"
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

    // Step 6.2 - "Actions to reduce your exposure to air pollution"
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

    // Step 6.3 - "Air pollution breaches"
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
    logger.info('--- RelatedContent EndScenario related content links -----')
  })
})
