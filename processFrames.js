const exp = require('constants');

fs = require('fs')
fs.readFile('tempShips.html', 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  processData(data);
});

const processData = (data) => {
  let spanArray = [];
  let baseFrameJSON = [];

  let startSnip = data.search("<span")
  let endSnip = data.search("</span>") +7

  while(startSnip != -1){
    spanArray.push(data.slice(startSnip, endSnip));
    data = data.slice(endSnip)

    startSnip = data.search("<span")
    endSnip = data.search("</span>") +7
  }

  spanArray.forEach((span, idx) => {
    var [span, type] = findComponent(span, 'ItemName=', '"')
    var [span, sourceLink] = findComponent(span, 'href="', '"')
    var [span, sourceText] = findComponent(span, '<i>', '</i>')
    var [span, size] = findComponent(span, '</b>', '<b>')
    var [span, maneuverability] = findComponent(span, '</b>', '<b>')
    var [span, hp] = findComponent(span, '</b>', '<b>')
    var [span, dt] = findComponent(span, '</b>', '<b>')
    var [span, ct] = findComponent(span, '</b>', '<b>')
    var [span, mounts] = findComponent(span, '</b>', '<b>')
    var [span, expansions] = findComponent(span, '</b>', '<b>')
    var [span, minimumCrew] = findComponent(span, '</b>', '<b>')
    var [span, maximumCrew] = findComponent(span, '</b>', '<b>')
    var [span, cost] = findComponent(span, '</b>', '<h3')
    var [span, specialAbility] = findComponent(span, '</b>', '<h3')

    if(dt === "—") dt = null;
    if(expansions === "—") expansions = "0";
    if(specialAbility === "0" || specialAbility === "") specialAbility = null;
    mounts = parseMounts(mounts)
    if(idx === 5) mounts.forwardArc.requirements = "1 light weapon must be a tracking weapon"

    hp = parseHP(hp)
    maneuverability = parseManeuverability(maneuverability)

    if(typeof (dt) === 'string') dt = parseInt(dt)
    ct = parseInt(ct)
    if(typeof (expansions) === 'string' && expansions[0] !== "—") expansions = parseInt(expansions)
    minimumCrew = parseInt(minimumCrew)
    maximumCrew = parseInt(maximumCrew)
    cost = parseInt(cost)

    baseFrameJSON.push({
      "type": type,
      "sourceLink": sourceLink,
      "sourceText": sourceText,
      "size": size,
      "maneuverability": maneuverability,
      "hp": hp,
      "dt": dt,
      "ct": ct,
      "mounts": mounts,
      "expansions": expansions,
      "minimumCrew": minimumCrew,
      "maximumCrew": maximumCrew,
      "cost": cost,
      "specialAbility": specialAbility
    })
  })
  

  // console.log(baseFrameJSON[9]);
  console.log(JSON.stringify(baseFrameJSON))
  // return baseFrameJSON;
}

// [span, type]
const findComponent = (span, removeString, endString) => {
  let snipLength = removeString.length
  let startSnip = span.search(removeString)
  span = span.slice(startSnip+snipLength)

  let endSnip = span.search(endString)
  let component = span.slice(0, endSnip)

  component = component
    .replace("<br />", "").replace("\r\n", "")
    .replace("&mdash;", "—").replace(";", "")
    .replace("<br />", "").replace("</span", "").replace("br />", "")
    .replace("unlimited", "unlimited;")
    .trim()

  return [span, component];
}

const parseMounts = (mounts) => {
  let arcSearches = ["forward arc", "port arc", "starboard arc", "aft arc", "turret"]
  let returnMounts = {}

  for(let arc of arcSearches){
    let snipLength = arc.length
    let snipPoint = mounts.search(arc)

    if(snipPoint >= 0){
      mounts = mounts.slice(snipPoint + snipLength)

      let start = mounts.search(/[(]/)
      let end = mounts.search(/[)]/)

      let weaponLayout = mounts.slice(start+1, end).split(",")
      let weaponTypes = ["light", "heavy", "capital", "spinal"]

      // [ '1 capital', ' 2 heavy' ] => [ [ 'capital', 1 ], [ 'heavy', 2 ] ],
      weaponLayout = weaponLayout.map(weaponArc => {
        let weaponArcObject = {}

        for(let type of weaponTypes){
          if(weaponArc.search(type) >= 0){
            weaponArcObject = [type, parseInt(weaponArc)]
          }
        }

        return weaponArcObject
      })

      // [ [ 'capital', 1 ], [ 'heavy', 2 ] ] => { { 'capital': 1 }, { 'heavy': 2 } }
      weaponLayout = Object.fromEntries(weaponLayout)

      if(arc === "forward arc") returnMounts.forwardArc = weaponLayout
      if(arc === "port arc") returnMounts.portArc = weaponLayout
      if(arc === "starboard arc") returnMounts.starboardArc = weaponLayout
      if(arc === "aft arc") returnMounts.aftArc = weaponLayout
      if(arc === "turret") returnMounts.turret = weaponLayout
    }
  }

  return returnMounts
}

const parseHP = (hp) => {
  let newHP = {}

  let start = hp.search(/[(]/)
  let end = hp.search(/[)]/)

  newHP.increment = parseInt(hp.slice(start+10, end))

  hp = hp.slice(0, start-1)
  newHP.startTotal = parseInt(hp)

  return newHP
}

const parseManeuverability = (maneuverability) => {
  let moveTypes = ["Clumsy", "Poor", "Average", "Good", "Perfect"]
  let parsedMove = ''

  for(let type of moveTypes){
    if(maneuverability.search(type.toLowerCase()) >= 0) parsedMove = type
  }

  return parsedMove
}
  
{/* 
  maneuverability: {
    clumsy: {
      pilotingMod: -2,
      turn: 4
    },
    poor: {
      pilotingMod: -1,
      turn: 3
    },
    average: {
      pilotingMod: 0,
      turn: 2
    },
    good: {
      pilotingMod: 1,
      turn: 1
    },
    perfect: {
      pilotingMod: 2,
      turn: 0
    }
  }
*/}
