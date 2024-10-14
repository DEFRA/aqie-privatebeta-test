class ForecastMainPage {
  // change location link
  get changeLocationLink() {
    return $("a[class='govuk-back-link']")
  }

  get regionHeaderDisplay() {
    return $("h1[class='govuk-heading-xl']")
  }

  get subHeadersinForecastPage() {
    return $$("h2[class='govuk-heading-m']")
  }

  async pollutantsHeaderLinksArrCheck() {
    const arr = await $$("h2[class='govuk-heading-m']")
    const arrcheck = Array.isArray(arr)
    return arrcheck
  }

  // DAQI forecast

  get daqiForecastValue() {
    return $("[class*='daqi-selected']")
  }

  get daqiForecastCaption() {
    return $("h2[class='govuk-heading-m govuk-!-margin-bottom-6']")
  }

  // Hidden object - accessibility
  get daqiHiddenForecastCaption() {
    return $("span[class='govuk-visually-hidden']")
  }

  // Hidden object - accessibility
  get daqiHiddenScaleForecastCaption() {
    return $("span[class='daqi-scale-hidden']")
  }

  get daqiForecastHeader() {
    return this.subHeadersinForecastPage[0]
  }

  // All para in forecastpage
  get forecastMainPagePara() {
    return $$('p')
  }

  // Health advice para first line
  get daqiForecastPara() {
    return this.forecastMainPagePara[5]
  }

  // reading measurement para first line
  get readingMeasuredPara() {
    return this.forecastMainPagePara[19]
  }

  // Station areatype para first line
  get stationAreaTypePara() {
    return this.forecastMainPagePara[21]
  }

  // station name
  get stationFirstName() {
    return $(
      "h3[class='govuk-heading-s govuk-!-margin-bottom-1 pollutant-table']"
    )
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

  // Pollutant link

  get pollutantFetchTable1() {
    return $('//*[@id="1"]/tbody/tr[1]/td[2]')
  }

  get pollutantsUKSummaryLinks() {
    return this.subHeadersinForecastPage[1]
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

  get pollutantsLinkOzone() {
    return this.pollutantsLink[1]
  }

  get pollutantsLinkNO2() {
    return this.pollutantsLink[2]
  }

  get pollutantsLinkSO2() {
    return this.pollutantsLink[3]
  }

  get pollutantsLinkPM25() {
    return this.pollutantsLink[4]
  }

  get pollutantsLinkPM10() {
    return this.pollutantsLink[5]
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
