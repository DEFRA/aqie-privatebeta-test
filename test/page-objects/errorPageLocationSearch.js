class ErrorPageLocationSearch {
  get errorHeaderDisplay() {
    return $("h1[class='govuk-heading-l']")
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

  async clickBackToHomePage() {
    await $("//a[normalize-space()='Ewch yn ôl i ansawdd aer lleol']").click()
  }
}

export default new ErrorPageLocationSearch()
