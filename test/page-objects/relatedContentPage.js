import { $ } from '@wdio/globals'

class RelatedContentPage {
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

  // Related content links (selected by their stable href segments)
  get healthEffectsLink() {
    return $("a[href*='/health-effects']")
  }

  get actionsReduceExposureLink() {
    return $("a[href*='/actions-reduce-exposure']")
  }

  get airPollutionBreachesLink() {
    return $("a[href*='/air-pollution-breaches']")
  }

  async clickHealthEffectsLink() {
    await this.healthEffectsLink.click()
  }

  async clickActionsReduceExposureLink() {
    await this.actionsReduceExposureLink.click()
  }

  async clickAirPollutionBreachesLink() {
    await this.airPollutionBreachesLink.click()
  }

  // ----- Related content target pages -----
  // Main heading of the landed page (health effects / actions / breaches)
  get pageHeader() {
    return $('h1')
  }

  // "Air pollution in <place>" back link that returns to the location page.
  // The place name is dynamic, so it is passed in from the test.
  backToLocationLink(placeName) {
    return $('=Air pollution in ' + placeName)
  }

  async clickBackToLocation(placeName) {
    await this.backToLocationLink(placeName).click()
  }
}

export default new RelatedContentPage()
