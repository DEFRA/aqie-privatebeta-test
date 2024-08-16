import { $ } from '@wdio/globals'

class LocationSearchPage {
  get getRadiobtn() {
    return $$("label[class='govuk-label govuk-radios__label']")
  }

  get getLocationSearchHeader() {
    return $("h1[class='govuk-fieldset__heading']")
  }

  get getLocationSearchHeaderText() {
    return $$("label[class='govuk-label']")
  }

  get locationESWBox() {
    return $('#engScoWal')
  }

  get locationNIBox() {
    return $('#ni')
  }

  get continueBtn() {
    return $("button[class='govuk-button app-search__button']")
  }

  get errorMessageNoChoice() {
    return $("a[href='#itembox']")
  }

  get emptyBoxValidationTitle() {
    return $("h2[class='govuk-error-summary__title']")
  }

  get emptyBoxValidationESW() {
    return $("li a[href='#engScoWal']")
  }

  get emptyBoxValidationNI() {
    return $("li a[href='#ni']")
  }

  get colorLocationSearchBoxText() {
    return $('#locationType-error')
  }

  get eswRadiobtnText() {
    return this.getRadiobtn[0]
  }

  get niRadiobtnText() {
    return this.getRadiobtn[1]
  }

  get eswLocationBoxText() {
    return this.getLocationSearchHeaderText[0]
  }

  get niLocationBoxText() {
    return this.getLocationSearchHeaderText[1]
  }

  get selectChoiceError() {
    return $("a[href='#itembox']")
  }

  async setUserESWRegion(inputRegion) {
    await this.locationESWBox.setValue(inputRegion)
  }

  async setUserNIRegion(inputRegion) {
    await this.locationNIBox.setValue(inputRegion)
  }

  async clickContinueBtn() {
    await this.continueBtn.click()
  }

  async clickESWRadiobtn() {
    await this.getRadiobtn[0].click()
  }

  async clickNIRadiobtn() {
    await this.getRadiobtn[1].click()
  }

  // Welsh Translation
  get linkButtonEnglish() {
    return $("a[href*='lang=en']")
  }

  get linkButtonWelsh() {
    return $("a[href*='lang=cy']")
  }

  get linkToggleButtons() {
    return $$("li[class='dwp-language-toggle__list-item']")
  }

  get linkToggleButtonsEng() {
    return this.linkToggleButtons[0]
  }

  get linkToggleButtonsCy() {
    return this.linkToggleButtons[1]
  }
}

// module.exports=new LocationSearchPage()
export default new LocationSearchPage()
