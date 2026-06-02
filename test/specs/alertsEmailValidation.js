/* eslint-disable wdio/no-pause */
import { browser, expect, $ } from '@wdio/globals'
import startNowPage from '../page-objects/startnowpage.js'
import locationSearchPage from '../page-objects/locationsearchpage.js'
import alertsEmailPage from '../page-objects/alertsEmailPage.js'
import cookieBanner from '../page-objects/cookieBanner.js'
import createLogger from '../helpers/logger.js'
import config from '../helpers/config.js'

const logger = createLogger()

const searchLocation = 'Bentham'
const matchLocation = 'High Bentham, North Yorkshire'
// Email address kept out of source files for data privacy - sourced from config
const emailAddress = config.get('alertEmailAddress')

describe('Alerts - Get alerts by email', () => {
  it('Set up an email air pollution alert journey', async () => {
    logger.info('--- AlertsEmail StartScenario email alert journey --------')
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

    // Step 4 - Search and choose the matching location
    await locationSearchPage.setUserESWRegion(searchLocation)
    await browser.pause(3000)
    await locationSearchPage.clickContinueBtn()
    const matchLink = await $('=' + matchLocation)
    await matchLink.click()

    // Step 5 - Landing page has the alerts section and we save the place name
    // from the "Air quality in <place>" heading for use in step 13
    const locationHeader = await alertsEmailPage.locationPageHeader.getText()
    const placeName = locationHeader.replace(/^Air quality in\s*/i, '').trim()
    logger.info(`--- AlertsEmail saved place name: "${placeName}" --------`)
    const getAlertsSectionHeader =
      await alertsEmailPage.alertsSectionHeader.getText()
    await expect(getAlertsSectionHeader).toMatch('Air quality alerts')

    // Step 6 - Click "Get alerts by email"
    await alertsEmailPage.clickGetAlertsByEmailLink()
    await browser.pause(2000)

    // Steps 7 & 8 - Redirected to email details page, assert the heading
    await expect(browser).toHaveUrl(
      expect.stringContaining('/notify/register/email-details')
    )
    await expect(await alertsEmailPage.emailPageHeader.getText()).toMatch(
      'What is your email address?'
    )

    // Step 9 - Provide the email address (stored for use in step 12)
    await alertsEmailPage.setEmail(emailAddress)

    // Step 10 - Continue
    await alertsEmailPage.clickContinueBtn()
    await browser.pause(2000)

    // Step 11 - Page redirects to the "Check your email" page
    await expect(browser).toHaveUrl(
      expect.stringContaining('/notify/register/email-verify-email')
    )
    await expect(await alertsEmailPage.checkEmailHeader.getText()).toMatch(
      'Check your email'
    )

    // Step 12 - Activation link sentence shows the dynamic email from step 9
    const activationSentText =
      await alertsEmailPage.activationLinkSentPara.getText()
    await expect(activationSentText).toMatch(
      "We've sent an activation link to " + emailAddress
    )

    // Step 13 - Notifications sentence shows the dynamic place name from step 5
    const emailNotificationsText =
      await alertsEmailPage.emailNotificationsPara.getText()
    await expect(emailNotificationsText).toMatch(
      'get email notifications about air pollution in ' + placeName
    )

    // Step 14 - "Request a new activation link" link round-trip (back via back link)
    await alertsEmailPage.clickRequestNewLinkLink()
    await expect(await alertsEmailPage.requestNewLinkHeader.getText()).toMatch(
      'Request a new activation link'
    )
    await alertsEmailPage.clickBackLink()
    await expect(await alertsEmailPage.checkEmailHeader.getText()).toMatch(
      'Check your email'
    )

    // Step 15 - "set up text message alerts using a mobile phone number" link,
    // then browser back to land on the "Check your email" page
    await alertsEmailPage.clickSetupTextAlertsLink()
    await expect(await alertsEmailPage.smsMobileNumberHeader.getText()).toMatch(
      'What is your mobile phone number?'
    )
    await browser.back()
    await expect(await alertsEmailPage.checkEmailHeader.getText()).toMatch(
      'Check your email'
    )

    await browser.deleteCookies(['airaqie_cookie'])
    logger.info('--- AlertsEmail EndScenario email alert journey --------')
  })
})
