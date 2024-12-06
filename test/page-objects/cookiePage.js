class CookiePage {
  get arrCookiePageToLAQPageLink() {
    return $$("div[class='app-cookies-page'] a[class='govuk-link']")
  }

  // Check air quality -Link
  get CookiePageToLAQPageLink() {
    return this.arrCookiePageToLAQPageLink[0]
  }

  // cookie - Header
  get cookiePageHeader() {
    return $("h1[class='govuk-heading-xl']")
  }

  // Accept/reject Analytical cookies
  get radioButton() {
    return $$("input[class='govuk-radios__input']")
  }

  // Accept
  get acceptRadioButton() {
    return this.radioButton[0]
  }

  // Reject
  get rejectRadioButton() {
    return this.radioButton[1]
  }

  // saveCookieSettings
  get saveCookieSettings() {
    return $("button[class='govuk-button js-cookies-form-button']")
  }

  // success - banner
  get decisionHeaderBanner() {
    return $("h2[class='govuk-notification-banner__title']")
  }
}

export default new CookiePage()
