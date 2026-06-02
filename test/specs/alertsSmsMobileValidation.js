/* eslint-disable wdio/no-pause */
import { browser, expect, $ } from '@wdio/globals'
import startNowPage from '../page-objects/startnowpage.js'
import locationSearchPage from '../page-objects/locationsearchpage.js'
import alertsSmsPage from '../page-objects/alertsSmsPage.js'
import cookieBanner from '../page-objects/cookieBanner.js'
import createLogger from '../helpers/logger.js'
import config from '../helpers/config.js'
import fs from 'node:fs'

const invalidMobileNumbers = JSON.parse(
  fs.readFileSync('test/testdata/invalidMobileNumbers.json')
)
const journey = JSON.parse(
  fs.readFileSync('test/testdata/smsAlertJourney.json')
)
const logger = createLogger()

const searchLocation = journey.searchLocation
const matchLocation = journey.matchLocation
// Mobile number kept out of source files for data privacy - sourced from config
const mobileNumber = config.get('alertMobileNumber')
const expectedMobileError = 'Enter a UK mobile phone number, like 07700 900 982'

describe('Alerts - SMS mobile number validation', () => {
  it('Navigate to the SMS mobile number page from the location page', async () => {
    logger.info('--- AlertsSMS StartScenario Navigate to SMS page --------')
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

    // Step 4 - Search "Bentham" and choose "High Bentham, North Yorkshire"
    await locationSearchPage.setUserESWRegion(searchLocation)
    await browser.pause(3000)
    await locationSearchPage.clickContinueBtn()
    const matchLink = await $('=' + matchLocation)
    await matchLink.click()

    // Step 5 - Landing page contains the alerts section
    const getAlertsSectionHeader =
      await alertsSmsPage.alertsSectionHeader.getText()
    await expect(getAlertsSectionHeader).toMatch('Air quality alerts')

    // Step 6 - Click "Get alerts by text message"
    await alertsSmsPage.clickGetAlertsByTextLink()
    await browser.pause(2000)

    // Step 7 & 8 - Redirected to SMS page, assert the heading
    await expect(browser).toHaveUrl(
      expect.stringContaining('/notify/register/sms-mobile-number')
    )
    const getSmsPageHeader = await alertsSmsPage.smsPageHeader.getText()
    await expect(getSmsPageHeader).toMatch('What is your mobile phone number?')
    logger.info('--- AlertsSMS EndScenario Navigate to SMS page --------')
  })

  // Step 9 - Validate the mobile phone number field with invalid formats
  invalidMobileNumbers.forEach(({ value, scenario }) => {
    it(`shows an error for invalid mobile number - ${scenario}`, async () => {
      logger.info(
        `--- AlertsSMS StartScenario invalid mobile number - ${scenario} --------`
      )
      await alertsSmsPage.setMobileNumber(value)
      await alertsSmsPage.clickContinueBtn()
      await browser.pause(1000)

      // Error summary at the top of the page
      const getErrorSummaryTitle =
        await alertsSmsPage.errorSummaryTitle.getText()
      await expect(getErrorSummaryTitle).toMatch('There is a problem')

      const getErrorSummaryLink = await alertsSmsPage.errorSummaryLink.getText()
      await expect(getErrorSummaryLink).toMatch(expectedMobileError)

      // Inline error message below the input field
      const getInlineErrorMessage =
        await alertsSmsPage.inlineErrorMessage.getText()
      await expect(getInlineErrorMessage).toMatch(expectedMobileError)
      logger.info(
        `--- AlertsSMS EndScenario invalid mobile number - ${scenario} --------`
      )
    })
  })

  // Steps 1-18 - Full happy path: set up an SMS air pollution alert
  it('Set up an SMS air pollution alert - happy path', async () => {
    logger.info('--- AlertsSMS StartScenario Set up SMS alert happy path -----')
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
    // from the "Air quality in <place>" heading for use in steps 16 and 18
    const locationHeader = await alertsSmsPage.locationPageHeader.getText()
    const placeName = locationHeader.replace(/^Air quality in\s*/i, '').trim()
    logger.info(`--- AlertsSMS saved place name: "${placeName}" --------`)
    const getAlertsSectionHeader =
      await alertsSmsPage.alertsSectionHeader.getText()
    await expect(getAlertsSectionHeader).toMatch('Air quality alerts')

    // Step 6 - Click "Get alerts by text message"
    await alertsSmsPage.clickGetAlertsByTextLink()
    await browser.pause(2000)

    // Steps 7 & 8 - SMS page, assert heading and enter a valid mobile number
    await expect(browser).toHaveUrl(
      expect.stringContaining('/notify/register/sms-mobile-number')
    )
    await expect(await alertsSmsPage.smsPageHeader.getText()).toMatch(
      'What is your mobile phone number?'
    )
    await alertsSmsPage.setMobileNumber(mobileNumber)

    // Step 9 - Continue
    await alertsSmsPage.clickContinueBtn()

    // Step 10 - Assert the activation header and that the mobile number is shown
    // correctly (0 followed by 10 digits, first digit after 0 is a 7)
    await expect(await alertsSmsPage.activationHeader.getText()).toMatch(
      'We are going to send you an activation code'
    )
    const shownNumber = await alertsSmsPage.activationMobileNumber.getText()
    await expect(shownNumber).toMatch(/^07\d{9}$/)
    await expect(shownNumber).toEqual(mobileNumber)

    // Step 11 - "I want to use a different mobile number" link round-trip
    await alertsSmsPage.clickDifferentMobileNumberLink()
    await expect(await alertsSmsPage.smsPageHeader.getText()).toMatch(
      'What is your mobile phone number?'
    )
    await alertsSmsPage.setMobileNumber(mobileNumber)
    await alertsSmsPage.clickContinueBtn()
    await expect(await alertsSmsPage.activationHeader.getText()).toMatch(
      'We are going to send you an activation code'
    )

    // Step 12 - Agree and continue
    await alertsSmsPage.clickAgreeAndContinue()

    // Step 13 - "Check your mobile phone" page
    await expect(await alertsSmsPage.checkPhoneHeader.getText()).toMatch(
      'Check your mobile phone'
    )

    // Step 14 - "Request a new activation code" link round-trip (back via back link)
    await alertsSmsPage.clickRequestNewCodeLink()
    await expect(await alertsSmsPage.requestNewCodeHeader.getText()).toMatch(
      'Request a new activation code'
    )
    await alertsSmsPage.clickBackLink()
    await expect(await alertsSmsPage.checkPhoneHeader.getText()).toMatch(
      'Check your mobile phone'
    )

    // Step 14b & 15 - Enter the activation code and continue
    await alertsSmsPage.setActivationCode(journey.activationCode)
    await alertsSmsPage.clickContinueBtn()

    // Step 16 - Confirm page with the dynamic place name saved in step 5
    await expect(await alertsSmsPage.confirmHeader.getText()).toMatch(
      'Confirm you want to set up an alert for ' + placeName
    )

    // Step 17 - Confirm and set up alert
    await alertsSmsPage.clickConfirmAndSetupAlert()
    await browser.pause(2000)

    // Step 18 - Validate the success banner using the dynamic place name.
    // The test environment retains subscriptions and provides no UI to remove
    // them, so if this number already has an alert for the location the app
    // shows the "already been set up" page instead of the success banner. Both
    // outcomes confirm the journey completed for the saved place name.
    const currentUrl = await browser.getUrl()
    if (currentUrl.includes('/notify/register/sms-success')) {
      await expect(await alertsSmsPage.successBannerTitle.getText()).toMatch(
        'Success'
      )
      await expect(await alertsSmsPage.successBannerHeading.getText()).toMatch(
        'You have set up air pollution alerts for ' + placeName
      )
    } else {
      logger.info(
        '--- AlertsSMS alert already set up - validating duplicate page -----'
      )
      await expect(
        await alertsSmsPage.duplicateSubscriptionHeader.getText()
      ).toMatch('This alert has already been set up')
      await expect(
        await alertsSmsPage.duplicateSubscriptionBody.getText()
      ).toMatch(placeName)
    }
    await browser.deleteCookies(['airaqie_cookie'])
    logger.info('--- AlertsSMS EndScenario Set up SMS alert happy path -----')
  })
})
