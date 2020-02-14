async function execute(browser) {
  await browser
    // Navigate to starting URL 
    .officeLogin()
    .openChecker()
    .assert.visible('.checkTypeButtons button.leave')
    .click('.checkTypeButtons button.leave')
    .pause(1000)
}
module.exports = execute