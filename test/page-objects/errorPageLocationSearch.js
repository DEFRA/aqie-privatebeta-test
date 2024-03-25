class ErrorPageLocationSearch {
  get errorHeaderDisplay() {
    return $("h1[class='govuk-heading-l']")
  }

  get searchBackLink() {
    return $("a[href='/aqie-front-end/search-location']")
  }

  async clickSearchBackLink() {
    await $("a[href='/aqie-front-end/search-location']").click()
  }
}

export default new ErrorPageLocationSearch()
