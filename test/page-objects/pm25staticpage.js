class PM25staticpage {
  get pm25HeaderDisplay() {
    return $("h1[class='govuk-heading-xl']")
  }

  get pm25SubHeaderDisplay() {
    return $$("h2[class='govuk-heading-m']")
  }
}

export default new PM25staticpage()
