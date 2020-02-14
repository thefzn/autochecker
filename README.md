# Autochecker for Office 365
### What it does?
Using Node + Nightwatch (ChromeDriver), attempts to log into Office365, navigate to the checker page and automatically trigger check in/out and lunch start/end on a day.
- There's a seteable variation so actions are not triggered at the same time everyday.
- Automatically resets at next day.
- You setup your own schedule at an ENV file (example included).
- You setup your own Office 365 credentials
- You setup how many retries when an action fails

### What it doesn't do?
- Can't trigger break actions yet, only arrival, leave, lunch start and lunch end actions are supported.
- Can't read the current status of your checked. We trust the automation works and that's it.
- Doesn't notify when an action fails.
- Doesn't notity when your credentials are invalid.
- Doesn't have an interface.

### The variation
The actions won't be triggered at the provided time, but a span of time will be created and the actions will trigger randomly at some point:

Let's say you setup your arrival at 8:00am and a variation of 10mins, your ARRIVAL action will trigger at some point between 7:50am and 8:10am. There's more chances of actions getting triggered before the scheduled time.

### Installation
**Clone the repo**

```git clone https://github.com/thefzn/autochecker.git```

**Install the dependencies**

```npm i```

**IMPORTANT!!!!!**

`chromedriver` version should match your Chrome version, run `npm i chromedriver@80.0.1` or whatever version you have.

**Create your .env file.**

This file contains your Office365 credentials, work schedule and other setup.

The project includes an .env.config, you can copy-paste, rename to `.env` and place your config there.

**Run**

```npm start```

**Go AFK.**
