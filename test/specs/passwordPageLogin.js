import passwordPage from 'page-objects/passwordpage'
import cookieBanner from 'page-objects/cookieBanner'
import config from 'helpers/config'
import { browser, expect } from '@wdio/globals'
class PasswordPageLogin {
  async passwordPageLogin() {
    await browser.url('')
    await browser.maximizeWindow()
    await expect(browser).toHaveTitle(
      'Sign in - Check local air quality - GOV.UK'
    )
    const PasswordPageHeaderText = 'This is a private beta'
    const PasswordPageStatement =
      'You should only continue if you have been invited to.'
    const labelPassword = 'Password'
    const getPasswordPageHeaderText =
      await passwordPage.passwordPageHeaderText.getText()
    await expect(getPasswordPageHeaderText).toMatch(PasswordPageHeaderText)
    const getPasswordPageStatement =
      await passwordPage.statementInPasswordPage.getText()
    await expect(getPasswordPageStatement).toMatch(PasswordPageStatement)
    const getLabelPassword = await passwordPage.labelPassword.getText()
    await expect(getLabelPassword).toMatch(labelPassword)
    const getPassword = config.get('daqiePassword')
    await passwordPage.setPassword(getPassword)
    await passwordPage.continueBtnClick()
    // Handle the cookie banner
    if (await cookieBanner.cookieBannerDialog.isDisplayed()) {
      await cookieBanner.rejectButtonCookiesDialog.click()
      await cookieBanner.hideButtonHideDialog.click()
    }
  }
}

export default new PasswordPageLogin()
