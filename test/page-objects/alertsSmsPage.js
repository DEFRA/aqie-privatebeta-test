import { $ } from '@wdio/globals'

class AlertsSmsPage {
  // ----- Forecast (location) page -----
  // Location page main heading e.g. "Air quality in High Bentham, North Yorkshire"
  get locationPageHeader() {
    return $("h1[class='govuk-heading-xl govuk-!-margin-top-4']")
  }

  // "Air quality alerts by text message or email" section heading
  get alertsSectionHeader() {
    return $('h2*=Air quality alerts')
  }

  // "Get alerts by text message" link on the forecast page
  get getAlertsByTextLink() {
    return $("a[href*='/notify/register/sms-mobile-number']")
  }

  async clickGetAlertsByTextLink() {
    await this.getAlertsByTextLink.click()
  }

  // ----- SMS mobile number page (sms-mobile-number) -----
  get smsPageHeader() {
    return $("h1[class='govuk-fieldset__heading']")
  }

  get mobileNumberLabel() {
    return $("label[for='notify-by-text']")
  }

  get mobileNumberInput() {
    return $('#notify-by-text')
  }

  get continueBtn() {
    return $("button[type='submit']")
  }

  // Error summary (top of the page)
  get errorSummaryTitle() {
    return $("h2[class='govuk-error-summary__title']")
  }

  get errorSummaryLink() {
    return $("ul[class='govuk-list govuk-error-summary__list'] a")
  }

  // Inline error message below the field
  get inlineErrorMessage() {
    return $('#notify-by-text-error')
  }

  async setMobileNumber(value) {
    await this.mobileNumberInput.clearValue()
    await this.mobileNumberInput.setValue(value)
  }

  async clickContinueBtn() {
    await this.continueBtn.click()
  }

  // ----- Send activation code page (sms-send-activation) -----
  get activationHeader() {
    return $("h1[class='govuk-heading-l']")
  }

  // The mobile number echoed back inside the confirmation paragraph
  get activationMobileNumber() {
    return $('//p[contains(., "send a text message")]//strong')
  }

  get differentMobileNumberLink() {
    return $('a*=different mobile number')
  }

  get agreeAndContinueBtn() {
    return $('#send-activation-submit')
  }

  async clickDifferentMobileNumberLink() {
    await this.differentMobileNumberLink.click()
  }

  async clickAgreeAndContinue() {
    await this.agreeAndContinueBtn.click()
  }

  // ----- Check your mobile phone page (sms-verify-code) -----
  get checkPhoneHeader() {
    return $("h1[class='govuk-heading-l']")
  }

  get activationCodeInput() {
    return $('#activation-code')
  }

  get requestNewCodeLink() {
    return $("a[href*='/notify/register/sms-send-new-code']")
  }

  // Top-left "Back" link (govuk back link)
  get backLink() {
    return $("a[class='govuk-back-link']")
  }

  async setActivationCode(code) {
    await this.activationCodeInput.clearValue()
    await this.activationCodeInput.setValue(code)
  }

  async clickRequestNewCodeLink() {
    await this.requestNewCodeLink.click()
  }

  async clickBackLink() {
    await this.backLink.click()
  }

  // ----- Request a new activation code page (sms-send-new-code) -----
  get requestNewCodeHeader() {
    return $("h1[class='govuk-heading-l']")
  }

  // ----- Confirm details page (sms-confirm-details) -----
  get confirmHeader() {
    return $("h1[class='govuk-heading-l']")
  }

  get confirmAndSetupAlertBtn() {
    return $("button[type='submit']")
  }

  async clickConfirmAndSetupAlert() {
    await this.confirmAndSetupAlertBtn.click()
  }

  // ----- Success page (sms-success) -----
  get successBannerTitle() {
    return $("h2[class='govuk-notification-banner__title']")
  }

  get successBannerHeading() {
    return $("h1[class='govuk-notification-banner__heading']")
  }

  // ----- Duplicate subscription page (duplicate-subscription) -----
  // Shown when the same number is already registered for the location
  get duplicateSubscriptionHeader() {
    return $('h1*=This alert has already been set up')
  }

  get duplicateSubscriptionBody() {
    return $('p*=You are already getting alerts')
  }
}

export default new AlertsSmsPage()
