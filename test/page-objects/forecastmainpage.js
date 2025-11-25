class ForecastMainPage {
  // change location link
  get changeLocationLink() {
    return $("a[class='govuk-back-link']")
  }

  get regionHeaderDisplay() {
    return $("h1[class='govuk-heading-xl govuk-!-margin-top-4']")
  }

  get subHeadersinForecastPage() {
    return $$("h2[class='govuk-heading-m']")
  }

  async pollutantsHeaderLinksArrCheck() {
    const arr = await $$("h2[class='govuk-heading-m']")
    const arrcheck = Array.isArray(arr)
    return arrcheck
  }

  // public Beta - 4 days forecast
  get getNext4DaysForecastHeader() {
    return $$("h2[class='govuk-heading-m govuk-!-margin-bottom-4']")
  }

  // distance of stations
  get distanceOfStations() {
    return $$("span[class='defra-aq-tabs__label-distance']")
  }

  // public beta
  get daqiOfCurrentDaysHeader() {
    return this.getNext4DaysForecastHeader[0]
  }

  // public beta
  get daqiOf4DaysHeader() {
    return this.getNext4DaysForecastHeader[1]
  }

  // Public Beta - 4 days values
  get getNext4DaysForecastValues() {
    return $$("dd[class*='daqi-tag-']")
  }

  // Public Beta - 4 days week days text
  get getNext4DaysForecastWeekDaysText() {
    return $$("div dt[class='aq-forecast-dt']")
  }

  // Public Beta
  get dayPlusOneName() {
    return this.getNext4DaysForecastWeekDaysText[0]
  }

  // Public Beta
  get dayPlusOneValue() {
    return this.getNext4DaysForecastValues[0]
  }

  // Public Beta
  get dayPlusTwoName() {
    return this.getNext4DaysForecastWeekDaysText[1]
  }

  // Public Beta
  get dayPlusTwoValue() {
    return this.getNext4DaysForecastValues[1]
  }

  // Public Beta
  get dayPlusThreeName() {
    return this.getNext4DaysForecastWeekDaysText[2]
  }

  // Public Beta
  get dayPlusThreeValue() {
    return this.getNext4DaysForecastValues[2]
  }

  // Public Beta
  get dayPlusFourName() {
    return this.getNext4DaysForecastWeekDaysText[3]
  }

  // Public Beta
  get dayPlusFourValue() {
    return this.getNext4DaysForecastValues[3]
  }

  get ukForecastArraylist() {
    return $$("h2[class='govuk-heading-s govuk-!-margin-bottom-1']")
  }

  // Public Beta
  get todayPollutantSummaryTitle() {
    return this.ukForecastArraylist[0]
  }

  // Public Beta
  get tomorrowPollutantSummaryTitle() {
    return this.ukForecastArraylist[1]
  }

  // Public Beta
  get outlookPollutantSummaryTitle() {
    return this.ukForecastArraylist[2]
  }

  get daqiForecastCaption() {
    return $("h2[class='govuk-heading-m govuk-!-margin-bottom-6']")
  }

  // DAQI forecast

  /* get daqiForecastValue() {
    return $("[class*='daqi-selected']")
  } */

  /* get daqiForecastCaption() {
    return $("h2[class='govuk-heading-m govuk-!-margin-bottom-6']")
  } */

  // Hidden object - accessibility
  get daqiHiddenForecastCaption() {
    return $("span[class='govuk-visually-hidden']")
  }

  // Hidden object - accessibility
  get daqiHiddenScaleForecastCaption() {
    return $("span[class='daqi-scale-hidden']")
  }

  get daqiForecastHeader() {
    return this.subHeadersinForecastPage[1]
  }

  // All para in forecastpage
  get forecastMainPagePara() {
    return $$('p')
  }

  // Health advice para first line
  get daqiForecastPara() {
    return this.forecastMainPagePara[5]
  }

  // UK Forecast Pollutant Summary
  get todayPollutantSummary() {
    return this.forecastMainPagePara[5]
  }

  // 2nd tab of DAQI
  get tomorowDAQIPollutantSummary() {
    return this.forecastMainPagePara[6]
  }

  // outlook DAQI Summary -day3
  get outlookDay3DAQIPollutantSummary() {
    return this.forecastMainPagePara[7]
  }

  // outlook DAQI Summary -day4
  get outlookDay4DAQIPollutantSummary() {
    return this.forecastMainPagePara[8]
  }

  // outlook DAQI Summary -day5
  get outlookDay5DAQIPollutantSummary() {
    return this.forecastMainPagePara[9]
  }

  // reading measurement para first line //edited from 19
  get readingMeasuredPara() {
    return this.forecastMainPagePara[24]
  }

  get readingMeasuredModeratePara() {
    return this.forecastMainPagePara[21]
  }

  get readingMeasuredHighPara() {
    return this.forecastMainPagePara[21]
  }

  get readingMeasuredVeryHighPara() {
    return this.forecastMainPagePara[21]
  }

  // Station areatype para first line //edited from 22
  get stationAreaTypePara() {
    return this.forecastMainPagePara[26]
  }

  get stationAreaTypeModeratePara() {
    return this.forecastMainPagePara[23]
  }

  get stationAreaTypeHighPara() {
    return this.forecastMainPagePara[23]
  }

  get stationAreaTypeVeryHighPara() {
    return this.forecastMainPagePara[23]
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
    return this.daqiAccordianHeader[0]
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
    return this.getNext4DaysForecastHeader[2]
  }

  /* get healthAdviseHeaders() {
    return this.subHeadersinForecastPage[0]
  } */

  get pollutantsHeaderLinks() {
    return this.subHeadersinForecastPage[0]
  }

  get pollutantsNameTableLinks() {
    return this.subHeadersinForecastPage[1]
  }

  get getHowAirPollutantsheader() {
    return this.subHeadersinForecastPage[2]
  }

  get timestampBlockForecastPage() {
    return $("p[class='govuk-caption-s daqi-health-summary-date']")
  }

  get pollutantsLink() {
    return $$("li a[class='govuk-link']")
  }

  get subHeaderPollutantLinks() {
    return $$("h2[class='govuk-heading-s']")
  }

  // pollutant tables
  get pollutantNameCollections() {
    return $$("a[class*='govuk-!-margin-bottom-1']")
  }

  get pollutantNameHeader() {
    return $$(
      "th[class='defra-aq-levels-table__cell defra-aq-levels-table__cell--pollutant']"
    )
  }

  get pollutantAreaNames() {
    return $$(
      "h3[class='govuk-heading-s govuk-!-margin-bottom-1 pollutant-table']"
    )
  }

  /*  get pollutantTabsNameItself() {
    return $$("a[class='govuk-tabs__tab']")
  } */

  get pollutantTabsNameItself() {
    return $$("a[href*='#tab-']")
  }

  get pollutantNameTabs() {
    return $$("a[class*='govuk-!-margin-bottom-1']")
  }

  get pollutantValueTabs() {
    return $$("span[class='govuk-!-font-weight-bold']")
  }

  get pollutantRangeTabs() {
    return $$(
      "td[class='govuk-table__cell align-middle'] strong[class*='daqi-tag']"
    )
  }

  // Get tab pollutants
  async tabPollutantsNameArrayCheck() {
    const countOfTab = await $$("a[class='govuk-tabs__tab']")
    // const arrcheck = Array.isArray(countOfTab)
    const isArrayValid = countOfTab.length > 0 ? countOfTab : false
    return isArrayValid
  }

  async tabPollutantsAreaNameLength() {
    const countOfTab = await $$("a[class='govuk-tabs__tab']").length
    return countOfTab
  }

  async tabPollutantsAreaNameAll() {
    return $$("a[href*='#tab-']")
  }

  // get tab pollutant values
  async tabPollutantsAreaName() {
    return $$(
      "h3[class='govuk-heading-s govuk-!-margin-bottom-1 pollutant-table']"
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
    return this.pollutantsLink[4]
  }

  get pollutantsLinkNO2() {
    return this.pollutantsLink[3]
  }

  get pollutantsLinkSO2() {
    return this.pollutantsLink[5]
  }

  get pollutantsLinkPM25() {
    return this.pollutantsLink[1]
  }

  get pollutantsLinkPM10() {
    return this.pollutantsLink[2]
  }

  get pageNotFoundHeader() {
    return $("h1[class='govuk-heading-xl']")
  }

  // New DAQI Redeisgn
  get todayDAQITab() {
    return $('#tab_today')
  }

  // Tomorow DAQI tab
  get tomorrowDAQITab() {
    return $('#tab_day2')
  }

  // Day after tomorow DAQI tab
  get dayThreeDAQITab() {
    return $('#tab_day3')
  }

  // Day 4 of DAQI tab
  get dayFourDAQITab() {
    return $('#tab_day4')
  }

  // Day 5 of DAQI tab
  get dayFiveDAQITab() {
    return $('#tab_day5')
  }

  get headerOfDAQITab() {
    return $("span[class='govuk-caption-s govuk-!-margin-bottom-4']")
  }

  // title of tabs day2
  async headerOfDAQITabSecondDay() {
    const container = await $('#day2')
    const daqiElement = await container.$(
      "span[class='govuk-caption-s govuk-!-margin-bottom-4']"
    )
    return daqiElement.getText()
  }

  // title of tabs day3
  async headerOfDAQITabThirdDay() {
    const container = await $('#day3')
    const daqiElement = await container.$(
      "span[class='govuk-caption-s govuk-!-margin-bottom-4']"
    )
    return daqiElement.getText()
  }

  // title of tabs day4
  async headerOfDAQITabFourthDay() {
    const container = await $('#day4')
    const daqiElement = await container.$(
      "span[class='govuk-caption-s govuk-!-margin-bottom-4']"
    )
    return daqiElement.getText()
  }

  // title of tabs day5
  async headerOfDAQITabFiveDay() {
    const container = await $('#day5')
    const daqiElement = await container.$(
      "span[class='govuk-caption-s govuk-!-margin-bottom-4']"
    )
    return daqiElement.getText()
  }

  async daqiForecastSegmentValue() {
    const coloredValue = await $("div[class*='daqi-selected']").getText()
    return coloredValue.toString()
  }

  // getAllDAQISelectedValues
  get getAllDAQISelectedValues() {
    return $$("div[class*='daqi-selected']")
  }

  // High level alert message symbol
  get highLevelAlertMessageSymbol() {
    return $("span[class='govuk-warning-text__icon']")
  }

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
