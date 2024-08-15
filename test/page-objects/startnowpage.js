import { $ } from '@wdio/globals'

class StartNowPage {
  get startNowPageHeaderText() {
    return $("h1[class*='govuk-heading-xl']")
  }

  get startNowBtn() {
    return $("a[class='govuk-button govuk-button--start']")
  }

  async startNowBtnClick() {
    await this.startNowBtn.click()
  }

  // Welsh Transalation

  get toWelshTranslationLink() {
    return $('//a[text()=" in Welsh"]')
  }

  get welshStartNowPageHeaderText() {
    return $("h1[class='govuk-heading-xl govuk-!-margin-bottom-2']")
  }

  get toEnglishTranslationLink() {
    return $('//a[text()=" yn Saesneg"]')
  }
}

// module.exports=new StartNowPage()
export default new StartNowPage()
