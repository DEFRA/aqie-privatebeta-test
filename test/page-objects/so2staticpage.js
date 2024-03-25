class SO2staticpage {
  get so2HeaderDisplay() {
    return $("h1[class='govuk-heading-xl']")
  }

  get so2SubHeaderDisplay() {
    return $$("h2[class='govuk-heading-m']")
  }
}

export default new SO2staticpage()
