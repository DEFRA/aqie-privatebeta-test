class HeadersObjects {
  get govUKCrownLink() {
    return $("a[class='govuk-header__link govuk-header__link--homepage']")
  }

  get claqLink() {
    return $("a[class='govuk-header__link govuk-header__service-name']")
  }

  // Beta Banner
  get betaBanner() {
    return $("strong[class='govuk-tag govuk-phase-banner__content__tag']")
  }

  // Beta Banner - Feedback
  get betaBannerFeedback() {
    return $("span[class='govuk-phase-banner__text'] a[class='govuk-link']")
  }
}

export default new HeadersObjects()
