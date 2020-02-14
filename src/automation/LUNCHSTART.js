async function execute(browser) {
  await browser
    // Navigate to starting URL 
    .officeLogin()
    .openChecker()
    .assert.visible('.checkTypeButtons button.lunch')
    .click('.checkTypeButtons button.lunch')
    .pause(1000)
}
module.exports = execute