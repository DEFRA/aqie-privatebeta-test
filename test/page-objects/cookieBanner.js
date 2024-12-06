class CookieBanner {
  get cookieBannerDialog() {
    return $("div[class='govuk-cookie-banner']")
  }

  get headerCookieBannerDialog() {
    return $("h2[class='govuk-cookie-banner__heading govuk-heading-m']")
  }

  get acceptButtonCookiesDialog() {
    return $("button[class='govuk-button js-cookie-banner-accept']")
  }

  get rejectButtonCookiesDialog() {
    return $("button[class='govuk-button js-cookie-banner-reject']")
  }

  get viewYourCookieLinkDialog() {
    return $("div[class='govuk-button-group'] a[class='govuk-link']")
  }

  // reject the cookie, the next banner
  get rejectStatementinHideDialog() {
    return $(
      "div[class='govuk-cookie-banner__message js-cookie-banner-confirmation-reject app-width-container govuk-width-container'] p[class='govuk-body']"
    )
  }

  // accept the cookie, the next banner
  get acceptStatementinHideDialog() {
    return $(
      "div[class='govuk-cookie-banner__message js-cookie-banner-confirmation-accept app-width-container govuk-width-container'] p[class='govuk-body']"
    )
  }

  get allCookiesPageLinks() {
    return $$("a[href='/cookies']")
  }

  get cookiesPageLinkHideDialog() {
    return $(
      "div[class='govuk-cookie-banner__message js-cookie-banner-confirmation-accept app-width-container govuk-width-container'] a[class='govuk-link']"
    )
  }

  get rejectCookieSettingHideDialog() {
    return $(
      "div[class='govuk-cookie-banner__message js-cookie-banner-confirmation-reject app-width-container govuk-width-container'] a[class='govuk-link']"
    )
  }

  get acceptCookieSettingHideDialog() {
    return $(
      "div[class='govuk-cookie-banner__message js-cookie-banner-confirmation-accept app-width-container govuk-width-container'] a[class='govuk-link']"
    )
  }

  get hideButtonHideDialog() {
    return $(
      "button[class*='govuk-button js-cookie-banner-hide js-cookie-banner-hide--reject']"
    )
  }

  // inside cookie page
  // cookies wording
  get checkForCookiesPage() {
    return $("h1[class*='govuk-heading-xl']")
  }

  // essential cookies  wording
  get checkForECCookiesPage() {
    return $("h2[class='govuk-heading-m']")
  }

  // You’ve set your cookie preferences.
  get decisionDialogPara() {
    return $("p[class='govuk-notification-banner__heading']")
  }
}

export default new CookieBanner()
