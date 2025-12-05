import cookieBanner from '../page-objects/cookieBanner.js'
import cookiePage from '../page-objects/cookiePage.js'
import startNowPage from '../page-objects/startnowpage.js'
import createLogger from '../helpers/logger.js'
import { browser, expect } from '@wdio/globals'

const logger = createLogger()
describe('Cookies Validation', () => {
  it('Cookies Banner- Accept Cookies', async () => {
    logger.info('--- CBC StartScenario Cookies Banner- Accept Cookies --------')
    await browser.deleteCookies()
    await browser.url('')
    await browser.maximizeWindow()
    if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
      // Validate _ga cookie not comes until user accepts
      const allCookies = await browser.getCookies()
      let setGAValue = 'false'
      for (let i = 0; i < allCookies.length; i++) {
        if (
          allCookies[i].name === '_ga' ||
          allCookies[i].name === '_gid' ||
          allCookies[i].name === '_ga_8CMZBTDQBC'
        ) {
          setGAValue = 'true'
          logger.error('Google Analytics cookie logged - Not Expected')
          await expect(setGAValue).toMatch('false')
        } else {
          logger.info(`logged cookies ${allCookies[i].name}`)
        }
      }
      // validation of the header in cookie banner
      const getHeaderOfCookieBanner =
        await cookieBanner.headerCookieBannerDialog.getText()
      const headerFromApplication = 'Cookies on Check air quality'
      await expect(getHeaderOfCookieBanner).toMatch(headerFromApplication)
      // validation of the buttons
      const getAcceptButtonOfCookieBanner =
        await cookieBanner.acceptButtonCookiesDialog.getText()
      const acceptBtnText = 'Accept analytics cookies'
      await expect(getAcceptButtonOfCookieBanner).toMatch(acceptBtnText)
      // Accepted the cookies
      await cookieBanner.acceptButtonCookiesDialog.click()
      // await browser.refresh()
      // airaqie_cookies_analytics should be true
      const airaqieCookiesAnalytics = await browser.getCookies([
        'airaqie_cookies_analytics'
      ])
      await expect(airaqieCookiesAnalytics[0].value).toMatch('true')
      let setGAValue1 = 'false'
      for (let k = 0; k < allCookies.length; k++) {
        if (
          allCookies[k].name === '_ga' ||
          allCookies[k].name === '_gid' ||
          allCookies[k].name === '_ga_8CMZBTDQBC'
        ) {
          setGAValue1 = 'true'
          logger.info(
            `After Accept button Google Analytics Cookies ${allCookies[k].name}`
          )
          await expect(setGAValue1).toMatch('false')
        } else {
          logger.info(
            `After Accept button in banner logged cookies ${allCookies[k].name}`
          )
        }
      }

      // check for accepted in the dialog box
      const lineInCookieinHideDialog =
        'You’ve accepted analytics cookies. You can change your cookie settings at any time.'
      const getAcceptedValue =
        await cookieBanner.acceptStatementinHideDialog.getText()
      await expect(getAcceptedValue).toMatch(lineInCookieinHideDialog)
      const getCookieSettingsLink =
        await cookieBanner.acceptCookieSettingHideDialog.getText()
      await expect(getCookieSettingsLink).toMatch('change your cookie settings')
      await cookieBanner.acceptCookieSettingHideDialog.click()
      const getHeaderInCookiePage =
        await cookieBanner.checkForCookiesPage.getText()
      await expect(getHeaderInCookiePage).toMatch('Cookies')
      const getECHeaderInCookiePage =
        await cookieBanner.checkForECCookiesPage.getText()
      await expect(getECHeaderInCookiePage).toMatch(
        'Essential cookies (strictly necessary)'
      )
      await cookiePage.saveCookieSettings.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      })
      await cookiePage.saveCookieSettings.click()
      // success dialog after save cookie page
      await cookiePage.decisionHeaderBanner.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      })
      const getDecisionInApplication =
        await cookiePage.decisionHeaderBanner.getText()
      await expect(getDecisionInApplication).toMatch('Success')
      const getDecisionParaInApplication =
        await cookieBanner.decisionDialogPara.getText()
      await expect(getDecisionParaInApplication).toMatch(
        'You’ve set your cookie preferences.'
      )
      await browser.back()
      // airaqie_cookies_analytics should be true
      const airaqieCookiesAnalytics1 = await browser.getCookies([
        'airaqie_cookies_analytics'
      ])
      await expect(airaqieCookiesAnalytics1[0].value).toMatch('true')
      const getGoogleAnalyticsCookieName = await browser.getCookies(['_ga'])
      for (let j = 0; j < allCookies.length; j++) {
        if (
          allCookies[j].name === '_ga' ||
          allCookies[j].name === '_gid' ||
          allCookies[j].name === '_ga_8CMZBTDQBC'
        ) {
          logger.info('Google Analytics cookie logs as expected')
          expect(getGoogleAnalyticsCookieName[0].name).toMatch('_ga')
        } else {
          logger.info(
            `Accept - NO GA Cookies logged  - logged cookies  ${allCookies[j].name}`
          )
        }
      }
    } else {
      logger.error('---NO COOKIES BANNER--- showed up in page')
    }
    // startnow-block
    await startNowPage.startNowBtnClick()
    const cookieBannerDisplayed =
      await cookieBanner.cookieBannerDialog.isDisplayed()
    await expect(cookieBannerDisplayed.toString()).toMatch('false')
    await browser.deleteCookies()
    logger.info('--- CBC EndScenario Cookies Banner- Accept Cookies --------')
  })
  it('Cookies Banner- Reject Cookies', async () => {
    logger.info('--- CBC StartScenario Cookies Banner- Reject Cookies --------')
    await browser.deleteCookies()
    await browser.url('')
    await browser.maximizeWindow()
    await browser.waitUntil(
      async () => await cookieBanner.cookieBannerDialog.isDisplayed(),
      {
        timeout: 1000, // Adjust timeout as needed
        timeoutMsg: 'Cookie banner did not appear within 1 second'
      }
    )
    if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
      // validation of the buttons
      const getRejectButtonOfCookieBanner =
        await cookieBanner.rejectButtonCookiesDialog.getText()
      const rejectBtnText = 'Reject analytics cookies'
      await expect(getRejectButtonOfCookieBanner).toMatch(rejectBtnText)
      // Reject the cookies
      await cookieBanner.rejectButtonCookiesDialog.click()

      const lineInCookieinHideDialog =
        'You’ve rejected analytics cookies. You can change your cookie settings at any time.'
      // Check for rejected in the dialog box
      const getRejectedValue =
        await cookieBanner.rejectStatementinHideDialog.getText()
      // Analytical cookie is false
      const airaqieCookiesAnalytics1 = await browser.getCookies([
        'airaqie_cookies_analytics'
      ])
      await expect(airaqieCookiesAnalytics1[0].value).toMatch('false')
      await expect(getRejectedValue).toMatch(lineInCookieinHideDialog)
      const getCookieSettingsLink =
        await cookieBanner.rejectCookieSettingHideDialog.getText()
      await expect(getCookieSettingsLink).toMatch('change your cookie settings')
      await cookieBanner.hideButtonHideDialog.click()
      // Page refresh and get cookies at this stage, so no manual refresh
      const allCookies = await browser.getCookies()
      let setGAValue = 'false'
      for (let i = 0; i < allCookies.length; i++) {
        if (
          allCookies[i].name === '_ga' ||
          allCookies[i].name === '_gid' ||
          allCookies[i].name === '_ga_8CMZBTDQBC'
        ) {
          setGAValue = 'true'
          await expect(setGAValue).toMatch('false')
        } else {
          logger.info('No Google Analytics cookie logged as expected')
        }
      }
    } else {
      logger.error('---NO COOKIES BANNER--- showed up in page')
    }
    // startnow-block
    await startNowPage.startNowBtnClick()
    const cookieBannerDisplayed =
      await cookieBanner.cookieBannerDialog.isDisplayed()
    await expect(cookieBannerDisplayed.toString()).toMatch('false')
    await browser.deleteCookies()
    logger.info('--- CBC EndScenario Cookies Banner- Reject Cookies --------')
  })
  it('Cookies Banner- View Cookies', async () => {
    logger.info('--- CBC StartScenario Cookies Banner- View Cookies --------')
    await browser.deleteCookies()
    await browser.url('')
    await browser.maximizeWindow()
    if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
      const viewCookiesLink =
        await cookieBanner.viewYourCookieLinkDialog.getText()
      expect(viewCookiesLink).toMatch('View cookies')
      await cookieBanner.viewYourCookieLinkDialog.click()
      const headerCookiePage = await cookiePage.cookiePageHeader.getText()
      // cookie page validations
      await expect(headerCookiePage).toMatch('Cookies')
      await browser.back()
      // Handle the cookie banner
      if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
        await cookieBanner.rejectButtonCookiesDialog.click()
        await cookieBanner.hideButtonHideDialog.click()
        // Analytical cookie is false
        const airaqieCookiesAnalytics1 = await browser.getCookies([
          'airaqie_cookies_analytics'
        ])
        await expect(airaqieCookiesAnalytics1[0].value).toMatch('false')
      }
    } else {
      logger.error('---NO COOKIES BANNER--- showed up in page')
    }
    // startnow-block
    await startNowPage.startNowBtnClick()
    const cookieBannerDisplayed =
      await cookieBanner.cookieBannerDialog.isDisplayed()
    await expect(cookieBannerDisplayed.toString()).toMatch('false')
    await browser.deleteCookies()
    logger.info('--- CBC EndScenario Cookies Banner- View Cookies --------')
  })
})
