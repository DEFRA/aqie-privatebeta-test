class NO2staticpage {
  get no2HeaderDisplay() {
    return $("h1[class*='govuk-heading-xl']")
  }

  get no2SubHeaderDisplay() {
    return $$("h2[class='govuk-heading-m']")
  }
}

export default new NO2staticpage()
