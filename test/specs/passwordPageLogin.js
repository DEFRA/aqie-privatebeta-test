import passwordPage from 'page-objects/passwordpage'
import { browser, expect } from '@wdio/globals'
class PasswordPageLogin {
  async passwordPageLogin() {
    await browser.url('/aqie-front-end')
    await browser.maximizeWindow()
    await expect(browser).toHaveTitle('Sign in - Private beta air quality')
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
    await passwordPage.setPassword('n1tr0g3n')
    await passwordPage.continueBtnClick()
  }
}

export default new PasswordPageLogin()
