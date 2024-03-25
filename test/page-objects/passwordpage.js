class PasswordPage {
  get passwordPageHeaderText() {
    return $("h1[class='govuk-heading-xl']")
  }

  get statementInPasswordPage() {
    return $("p[class='govuk-body-m']")
  }

  get labelPassword() {
    return $("label[class='govuk-label govuk-label']")
  }

  get passwordBox() {
    return $("input[class='govuk-input govuk-!-width-one-third']")
  }

  get continueButton() {
    return $("button[class='govuk-button']")
  }

  async setPassword(password) {
    await this.passwordBox.setValue(password)
  }

  async continueBtnClick() {
    await this.continueButton.click()
  }
}

export default new PasswordPage()
