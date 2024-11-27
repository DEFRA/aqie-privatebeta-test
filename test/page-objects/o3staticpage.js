class O3Staticpage {
  get o3HeaderDisplay() {
    return $("h1[class='govuk-heading-xl odd-page']")
  }

  get o3SubHeaderDisplay() {
    return $$("h2[class='govuk-heading-m']")
  }
}

export default new O3Staticpage()
