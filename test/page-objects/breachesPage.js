import { $ } from '@wdio/globals'

class BreachesPage {
  // ----- Forecast (location) page -----
  // Location page main heading e.g. "Air quality in Welshpool Mid Wales Airport, Powys - Powys"
  get locationPageHeader() {
    return $("h1[class='govuk-heading-xl govuk-!-margin-top-4']")
  }

  // "Air quality alerts by text message or email" section heading
  get alertsSectionHeader() {
    return $('h2*=Air quality alerts')
  }

  // Right side pane "Related content" heading
  get relatedContentHeader() {
    return $('h2*=Related content')
  }

  // "Air pollution breaches" link in the Related content pane
  get airPollutionBreachesLink() {
    return $("a[href*='/air-pollution-breaches']")
  }

  async clickAirPollutionBreachesLink() {
    await this.airPollutionBreachesLink.click()
  }

  // ----- Air pollution breaches page -----
  get breachesPageHeader() {
    return $("h1[class='govuk-heading-l']")
  }

  // "Active breaches" sub-section heading
  get activeBreachesHeader() {
    return $('h2*=Active breaches')
  }

  // Full sentence "There is currently <n> active air pollution breach"
  get activeBreachesText() {
    return $('p*=There is currently')
  }

  // The dynamic count rendered inside the <b> tag of the sentence above
  get activeBreachesCount() {
    return $('//p[contains(., "There is currently")]/b')
  }

  // "Past breaches" sub-section heading
  get pastBreachesHeader() {
    return $('h2*=Past breaches')
  }

  // "Recorded in the last 12 months" sub-heading
  get recordedLast12MonthsHeader() {
    return $('h3*=Recorded in the last 12 months')
  }

  // The accordion section headings listed under "Recorded in the last 12 months"
  // e.g. "Honiton, South West (27 May 2026)"
  get pastBreachesSections() {
    return $$("span[id^='past-breaches-accordion-heading-']")
  }
}

export default new BreachesPage()
