class ErrorPageLocationSearch {
  get errorHeaderDisplay() {
    return $("h1[class*='govuk-heading-l']")
  }

  get welshErrorHeaderDisplay() {
    return $("h1[class='govuk-heading-xl']")
  }

  get searchBackLink() {
    return $("a[href*='/search-location']")
  }

  async clickSearchBackLink() {
    await $("a[href*='/search-location']").click()
  }

  get airQualityTeamMailTo() {
    return $("a[href='mailto:checklocalairquality@defra.gov.uk']")
  }

  async clickBackToHomePage() {
    await $("a[class='govuk-header__link govuk-header__service-name']").click()
  }
}

export default new ErrorPageLocationSearch()
