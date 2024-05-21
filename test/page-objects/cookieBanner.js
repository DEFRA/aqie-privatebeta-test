/* eslint-disable prettier/prettier */
class CookieBanner {
  get cookieBannerDialog() {
    return $("div[class='govuk-cookie-banner']")
  }

  get headerCookieBannerDialog() {
    return $("h2[class='govuk-cookie-banner__heading govuk-heading-m']")
  }

  get acceptButtonCookiesDialog() {
    return $("button[class='defra-cookie-banner__button-accept']")
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

  get hideButtonHideDialog() {
    return $(
      "button[class*='govuk-button js-cookie-banner-hide js-cookie-banner-hide--reject']"
    )
  }

  // inside cookie page
  // cookies wording
  get checkForCookiesPage() {
    return $("h1[class='govuk-heading-xl']")
  }

  // essential cookies  wording
  get checkForECCookiesPage() {
    return $("h2[class='govuk-heading-m']")
  }

  // save cookies in cookies page
  get saveCookiesInCookiesPage() {
    return $('#cookies-save')
  }

  // After Save Cookies -success dialog
  get afterSaveCookiesInCookiesPage() {
    return $("h2[class='defra-cookie-notification__title']")
  }

  // After Save Cookies -success dialog - para
  get afterSaveCookiesParaInCookiesPage() {
    return $("p[class='defra-cookie-notification__heading']")
  }

  // After Save Cookies -success dialog - Link
  get afterSaveCookiesLinkInCookiesPage() {
    return $("a[href='https://check-for-flooding.service.gov.uk/']") // replace URL later
  }
}

export default new CookieBanner()
