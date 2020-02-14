const chromedriver = require('chromedriver')

module.exports = {
    src_folders: [`./src/automation`],
    workers: false,
    webdriver: {
      start_process: true,
      server_path: chromedriver.path,
      cli_args: ['--verbose'],
      port: 9515
    },
    test_settings: {
      default: {
        launch_url: 'http://localhost',
        desiredCapabilities: {
          browserName: 'chrome',
          loggingPrefs: {
            'driver': 'INFO',
            'server': 'OFF',
            'browser': 'INFO'
          },
          chromeOptions: {
              args: ["window-size=100,100"]
          }
        }
      },
    },
    globals_path: './src/globals.js',
    custom_commands_path: './src/commands',
    silent: true,
    disable_error_log: true
}