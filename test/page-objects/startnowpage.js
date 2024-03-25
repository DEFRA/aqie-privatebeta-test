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
}

// module.exports=new StartNowPage()
export default new StartNowPage()
