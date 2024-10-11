import startNowPage from 'page-objects/startnowpage'
import headersValidation from 'page-objects/headersObject'
import locationSearchPage from 'page-objects/locationsearchpage'
import footerObjects from 'page-objects/footer'
import { expect } from '@wdio/globals'
import cookiePage from 'page-objects/cookiePage'
import cookieBanner from 'page-objects/cookieBanner'
import createLogger from 'helpers/logger'
const logger = createLogger()
async function headerChecks() {
  // UK crown link header
  const govukLink = await headersValidation.govUKCrownLink.getText()
  await expect(govukLink.split(' ').pop()).toMatch('GOV.UK')
  const getURLGOVUK =
    await headersValidation.govUKCrownLink.getAttribute('href')
  await expect(getURLGOVUK).toMatch('https://www.gov.uk/')
  // Beta Banner
  const betaBannerText = await headersValidation.betaBanner.getText()
  await expect(betaBannerText).toMatch('Beta')
  const feedbackLink = await headersValidation.betaBannerFeedback.getText()
  await expect(feedbackLink).toMatch('adborth')
  const getURLFeedback =
    await headersValidation.betaBannerFeedback.getAttribute('href')
  await expect(getURLFeedback).toMatch(
    'https://defragroup.eu.qualtrics.com/jfe/form/SV_dj4wJCoOkFQLXfM'
  )
}

async function scrollToView() {
  try {
    await footerObjects.cookieFooterLink.scrollIntoView()
  } catch (error) {
    logger.info('ERRORINSCROLLINTOVIEW')
    logger.error(error)
  }
}

async function footerChecks() {
  await scrollToView()
  // Cookies link check
  const getCookieFooterLinkTextCookies =
    await footerObjects.cookieFooterLink.getText()
  await expect(getCookieFooterLinkTextCookies).toMatch('Cwcis')
  await footerObjects.cookieFooterLink.click()
  // Toggle back to English
  await locationSearchPage.linkButtonEnglish.click()
  const headerCookiePage = await cookiePage.cookiePageHeader.getText()
  // cookie page validations
  await expect(headerCookiePage).toMatch('Cookies')
  // Toggle back to welsh
  await locationSearchPage.linkButtonWelsh.click()
  const getCookieFooterLinkTextCookiesWelsh =
    await footerObjects.cookieFooterLink.getText()
  await expect(getCookieFooterLinkTextCookiesWelsh).toMatch('Cwcis')
  await headersValidation.claqLink.click()
  // Privacy link check
  await footerObjects.privacyFooterLink.click()
  const getCookieFooterLinkTextPrivacy =
    await footerObjects.privacyFooterLink.getText()
  await expect(getCookieFooterLinkTextPrivacy).toMatch('Preifatrwydd')
  // Toggle back to English
  await locationSearchPage.linkButtonEnglish.click()
  const getPrivacyFooterHeader =
    await footerObjects.getHeaderTextFooter.getText()
  await expect(getPrivacyFooterHeader).toMatch(
    'Check local air quality privacy notice'
  )
  // Toggle back to welsh
  await locationSearchPage.linkButtonWelsh.click()
  const getPrivacyFooterHeaderWelsh =
    await footerObjects.getHeaderTextFooter.getText()
  await expect(getPrivacyFooterHeaderWelsh).toMatch(
    'Hysbysiad preifatrwydd Gwirio ansawdd aer lleol'
  )
  await headersValidation.claqLink.click()
  // Acc-Stmt
  await footerObjects.AccStmtFooterLink.click()
  const getAccStmtFooterLinkText =
    await footerObjects.AccStmtFooterLink.getText()
  await expect(getAccStmtFooterLinkText).toMatch('Datganiad hygyrchedd')
  // Toggle back to English
  await locationSearchPage.linkButtonEnglish.click()
  const getAccStatFooterHeader =
    await footerObjects.getHeaderTextFooter.getText()
  await expect(getAccStatFooterHeader).toMatch('Accessibility Statement')
  // Toggle back to welsh
  await locationSearchPage.linkButtonWelsh.click()
  const getAccStmtFooterHeaderWelsh =
    await footerObjects.getHeaderTextFooter.getText()
  await expect(getAccStmtFooterHeaderWelsh).toMatch('Datganiad Hygyrchedd')
  await headersValidation.claqLink.click()
  // OGL
  const getOGLText = await footerObjects.oglFooterLink.getText()
  await expect(getOGLText).toMatch('Drwydded Llywodraeth Agored v3.0')
  const getHrefOgl = await footerObjects.oglFooterLink.getAttribute('href')
  const expectedOGLURL =
    'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'
  await expect(getHrefOgl).toMatch(expectedOGLURL)
  // UK Logo
  const getHeaderOfCookieBanner = await footerObjects.logoFooter.getText()
  await expect(getHeaderOfCookieBanner).toMatch('© Hawlfraint y Goron')
  const expectedLogoURL =
    'https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/'
  const getHrefLogo = await footerObjects.logoFooter.getAttribute('href')
  await expect(getHrefLogo).toMatch(expectedLogoURL)
}

describe('Welsh-Header-Footer-Static-Flow', () => {
  it('Welsh-Header', async () => {
    await browser.url('')
    await browser.maximizeWindow()
    // Handle the cookie banner
    if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
      await cookieBanner.rejectButtonCookiesDialog.click()
      await cookieBanner.hideButtonHideDialog.click()
    }
    if (await startNowPage.toWelshTranslationLink.isClickable()) {
      await startNowPage.toWelshTranslationLink.click()
      const StartPageHeaderText = 'Gwirio ansawdd aer lleol'
      const getStartPageHeaderText =
        await startNowPage.welshStartNowPageHeaderText.getText()
      await expect(getStartPageHeaderText).toMatch(StartPageHeaderText)
      // Start now page header checks
      await headerChecks()
      // Start now page footer checks
      await footerChecks()
    }
  })
})
