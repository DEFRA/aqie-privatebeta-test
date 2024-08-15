/* eslint-disable prettier/prettier */
class Footer {
  get allFooterLinks() {
    return $$("a[class='govuk-footer__link']")
  }

  get privacyFooterLink() {
    return this.allFooterLinks[0]
  }

  get cookieFooterLink() {
    return this.allFooterLinks[1]
  }

  get AccStmtFooterLink() {
    return this.allFooterLinks[2]
  }

  get oglFooterLink() {
    return this.allFooterLinks[3]
  }

  // logo
  get logoFooter() {
    return $("a[class='govuk-footer__link govuk-footer__copyright-logo']")
  }

  // Privacy, cookies, acc-stmt page Header Link
  get getHeaderTextFooter() {
    return $("h1[class='govuk-heading-xl']")
  }
}

export default new Footer()
