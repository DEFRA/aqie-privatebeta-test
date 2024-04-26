class ErrorPageLocationSearch {
  get errorHeaderDisplay() {
    return $("h1[class='govuk-heading-l']")
  }

  get searchBackLink() {
    return $("a[href='/search-location']")
  }

  async clickSearchBackLink() {
    await $("a[href='/search-location']").click()
  }
}

export default new ErrorPageLocationSearch()
