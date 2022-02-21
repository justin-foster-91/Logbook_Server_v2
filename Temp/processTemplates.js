fs = require('fs')
fs.readFile('templates.json', 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  processData(data);
});

const processData = (data) => {
  console.log(data[0])
}