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
            'browser': 'OFF'
          },
          chromeOptions: {
              args: ["window-size=200,400"]
          }
        }
      },
    },
    globals_path: './src/config/globals.js',
    custom_commands_path: './src/commands',
    silent: true,
    disable_error_log: true
}