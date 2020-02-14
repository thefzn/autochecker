let autochecker_timer = null
const ACTIONS = { 
  ARRIVE: 'arrive',
  LUNCH_START: 'lunch_start',
  LUNCH_END: 'lunch_end',
  LEAVE: 'leave'
}
const autochecker_schedule_default = {
  d: null,
  a: [
    {n: ACTIONS.ARRIVE, t: [8], d: false},
    {n: ACTIONS.LUNCH_START, t: [1,30], d: false},
    {n: ACTIONS.LUNCH_END, t: [2,30], d: false},
    {n: ACTIONS.LEAVE, t: [17], d: false}
  ]
}
function autochecker_tick () {
  chrome.storage.sync.get("autochecker_schedule", autochecker_schedule => {
    const date = new Date()
    const DD = date.getDate()
    const HH = date.getHours()
    const mm = date.getMinutes()

    try {
      const schedule = autochecker_schedule ? JSON.parse(autochecker_schedule) : autochecker_schedule_default
      let next = null
      if (schedule.d !== DD) schedule.a = schedule.a.map(action => Object.assign(action, {d: false}))


    } catch (e) {
      console.log(e)
    }
  })
}
function autochecker_start () {
  autochecker_timer = autochecker_timer || setTimeout(autochecker_tick, 60000)
  // chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
  //     chrome.storage.sync.get("jsbtn", function(jsbtn){
  //         var search,pages,i,len;
          
  //         pages = jsbtn.jsbtn.pages || false;
  //         if(pages && pages instanceof Array && pages.length){
  //             search = pages.join("|");
  //         }else{
  //             search = "github.com/thefzn|github.com/fznwebdesign";
  //         }
  //         search = (search + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
  //         chrome.declarativeContent.onPageChanged.addRules([
  //             {
  //                 conditions: [
  //                     new chrome.declarativeContent.PageStateMatcher({
  //                         pageUrl: { urlMatches: search },
  //                     })
  //                 ],
  //                 actions: [ new chrome.declarativeContent.ShowPageAction() ]
  //             }
  //         ]);
  //     })
  // });
}
chrome.runtime.onInstalled.addListener(autochecker_start);