const fs = require('fs');

// this module provides the getRandomLine function for the bot to talk randomly
var data;

fs.readFile('./qotd module/qotd.txt', 'utf8', function (err, rawData) {
  if (err) {
    return console.log(err);
  }
  data = rawData.split('\n');
});

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function getRandomLine(){
  return data[randomInt(0,data.length)];
}

module.exports = getRandomLine;// only exports the getRandomLine function
