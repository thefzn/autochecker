async function execute(browser) {
  await browser
    // Navigate to starting URL 
    .officeLogin()
    .openChecker()
    .assert.visible('.checkTypeButtons button.back-from-lunch')
    .click('.checkTypeButtons button.back-from-lunch')
    .pause(1000)
}
module.exports = execute