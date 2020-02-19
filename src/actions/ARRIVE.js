async function execute(browser) {
  await browser
    // Navigate to starting URL 
    .officeLogin()
    .openChecker()
    .assert.elementPresent('.checkTypeButtons button.arrival')
    .click('.checkTypeButtons button.arrival')
    .pause(1000)
}
module.exports = execute