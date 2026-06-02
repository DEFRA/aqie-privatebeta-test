import { $ } from '@wdio/globals'

class AlertsEmailPage {
  // ----- Forecast (location) page -----
  // Location page main heading e.g. "Air quality in High Bentham, North Yorkshire"
  get locationPageHeader() {
    return $("h1[class='govuk-heading-xl govuk-!-margin-top-4']")
  }

  // "Air quality alerts by text message or email" section heading
  get alertsSectionHeader() {
    return $('h2*=Air quality alerts')
  }

  // "Get alerts by email" link on the forecast page
  get getAlertsByEmailLink() {
    return $("a[href*='/notify/register/email-details']")
  }

  async clickGetAlertsByEmailLink() {
    await this.getAlertsByEmailLink.click()
  }

  // ----- Email details page (email-details) -----
  get emailPageHeader() {
    return $("h1[class='govuk-heading-l govuk-!-margin-top-7']")
  }

  get emailLabel() {
    return $("label[for='notifyByEmail']")
  }

  get emailInput() {
    return $('#notifyByEmail')
  }

  get continueBtn() {
    return $("button[class='govuk-button']")
  }

  async setEmail(value) {
    await this.emailInput.clearValue()
    await this.emailInput.setValue(value)
  }

  async clickContinueBtn() {
    await this.continueBtn.click()
  }

  // ----- Check your email page (email-verify-email) -----
  get checkEmailHeader() {
    return $("h1[class='govuk-heading-l']")
  }

  // "We've sent an activation link to <email>."
  get activationLinkSentPara() {
    return $('p*=sent an activation link to')
  }

  // "Use the link in the email to confirm you want to get email notifications
  //  about air pollution in <place>."
  get emailNotificationsPara() {
    return $('p*=get email notifications about air pollution in')
  }

  get requestNewLinkLink() {
    return $("a[href*='/notify/register/email-send-new-link']")
  }

  get setupTextAlertsLink() {
    return $("a[href*='/notify/register/sms-mobile-number']")
  }

  // Top-left "Back" link (govuk back link)
  get backLink() {
    return $("a[class='govuk-back-link']")
  }

  async clickRequestNewLinkLink() {
    await this.requestNewLinkLink.click()
  }

  async clickSetupTextAlertsLink() {
    await this.setupTextAlertsLink.click()
  }

  async clickBackLink() {
    await this.backLink.click()
  }

  // ----- Request a new activation link page (email-send-new-link) -----
  get requestNewLinkHeader() {
    return $("h1[class='govuk-heading-l']")
  }

  // ----- SMS mobile number page (sms-mobile-number) -----
  get smsMobileNumberHeader() {
    return $("h1[class='govuk-fieldset__heading']")
  }
}

export default new AlertsEmailPage()
