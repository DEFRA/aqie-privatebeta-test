class ForecastMainPage {
  get regionHeaderDisplay() {
    return $("h1[class='govuk-heading-xl']")
  }

  get subHeadersinForecastPage() {
    return $$("h2[class='govuk-heading-m']")
  }
  // DAQI forecast

  get daqiForecastValue() {
    return $("td[class*='daqi-selected']")
  }

  get daqiForecastCaption() {
    return $("h2[class='govuk-heading-m govuk-!-margin-bottom-6']")
  }

  get daqiForecastHeader() {
    return this.subHeadersinForecastPage[0]
  }

  // Health advice para first line
  get forecastMainPagePara() {
    return $$('p')
  }

  get daqiForecastPara() {
    return this.forecastMainPagePara[1]
  }

  // accordian link
  get daqiAccordian() {
    return $("summary[class='govuk-details__summary']")
  }

  get daqiAccordianHeader() {
    return $$("th[class='govuk-table__header']")
  }

  get daqiAccordianHeaderIndex() {
    return this.daqiAccordianHeader[1]
  }

  // pollutant summary

  get pollutantSummary() {
    return $("p[class='govuk-!-margin-bottom-6']")
  }

  // Station Name
  get pollutantStationNamesArr() {
    return $$(
      "div[class='defra-toggletip defra-toggletip--open defra-toggletip--up']"
    )
  }

  // ToolTip
  get toolTipMessageArr() {
    return $$("span[class='defra-toggletip__text']")
  }

  // ToolTip Button
  get toolTipButtonArr() {
    return $$(
      "button[class='tooltip defra-toggletip__button defra-toggletip-target']"
    )
  }

  get toolTipButton1() {
    return this.toolTipButtonArr[0]
  }

  get toolTipButton2() {
    return this.toolTipButtonArr[1]
  }

  get toolTipButton3() {
    return this.toolTipButtonArr[2]
  }

  get toolTipMessage1() {
    return this.toolTipMessageArr[0]
  }

  get toolTipMessage2() {
    return this.toolTipMessageArr[1]
  }

  get toolTipMessage3() {
    return this.toolTipMessageArr[2]
  }

  get pollutantStationName() {
    return this.pollutantStationNamesArr[0]
  }

  // Pollutant link

  get pollutantFetchTable1() {
    return $('//*[@id="1"]/tbody/tr[1]/td[2]')
  }

  get pollutantsHeaderLinks() {
    return this.subHeadersinForecastPage[2]
  }

  get pollutantsNameTableLinks() {
    return this.subHeadersinForecastPage[3]
  }

  get timestampBlockForecastPage() {
    return $("p[class='govuk-caption-s govuk-!-margin-bottom-4']")
  }

  get pollutantsLink() {
    return $$("li a[class='govuk-link']")
  }

  get subHeaderPollutantLinks() {
    return $$("h2[class='govuk-heading-s']")
  }

  // pollutant tables
  get pollutantNameCollections() {
    return $$("a[class='govuk-!-margin-bottom-1']")
  }

  get pollutantNameHeader() {
    return $$(
      "th[class='defra-aq-levels-table__cell defra-aq-levels-table__cell--pollutant']"
    )
  }

  get pollutantValueCollections() {
    return $$(
      "td[class='defra-aq-levels-table__cell defra-aq-levels-table__cell--reading']"
    )
  }

  get pollutantLevelCollections() {
    return $$(
      "td[class='defra-aq-levels-table__cell defra-aq-levels-table__cell--level']"
    )
  }

  get timestampPollutantTable() {
    return $$("p[class='govuk-caption-s govuk-!-margin-bottom-6']")
  }

  get timestandPollutantTable1() {
    return this.timestampPollutantTable[0]
  }

  get pollutantNameHeader1() {
    return this.pollutantNameHeader[0]
  }

  /* get pollutantNearestRegions() {
    return $$(
      "h3 div[class='defra-toggletip defra-toggletip--open defra-toggletip--up']"
    )
  }

  get pollutantStationName1() {
    return this.pollutantNearestRegions[0]
  } */

  async pollutantsFirstTableCollections() {
    const arr = []
    for (let i = 1; i <= 5; i++) {
      for (let j = 1; j <= 3; j++) {
        const values = $('//*[@id="1"]/tbody/tr[' + i + ']/td[' + j + ']')
        const isExisting = await values.isExisting()
        if (isExisting) {
          if (
            (await values.getText()) !== null ||
            (await values.getText()) !== ''
          ) {
            arr.push(await values.getText())
          }
        }
      }
    }
    return arr
  }
}

export default new ForecastMainPage()
