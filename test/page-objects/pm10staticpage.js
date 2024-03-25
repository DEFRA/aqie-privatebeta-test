class PM10staticpage {
  get pm10HeaderDisplay() {
    return $("h1[class='govuk-heading-xl']")
  }

  get pm10SubHeaderDisplay() {
    return $$("h2[class='govuk-heading-m']")
  }
}

export default new PM10staticpage()
