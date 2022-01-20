// import { parse } from 'node-html-parser';
let parse = require('node-html-parser').parse;
// console.log(parse);

fs = require('fs')
fs.readFile('tempShips.html', 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  // console.log(data);
  processData(data);
});


const processData = (data) => {
  let spanArray = [];
  let shipJson = [];

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
    if(dt === "ꝏ") dt = null;
    if(expansions === "ꝏ") expansions = "0";
    if(specialAbility === "0" || specialAbility === "") specialAbility = null;

    shipJson.push({
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
  
    //TODO: mounts and expansions into object
    //TODO: parse numbers


  console.log(shipJson[0]);
  // console.log(spanArray[0]);
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
    .replace("&mdash;", "ꝏ").replace(";", "")
    .replace("<br />", "").replace("</span", "").replace("br />", "")
    .replace("unlimited", "unlimited;")
    .trim()

  return [span, component];
}


  
