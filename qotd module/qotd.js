const Discord = require("discord.js")
const { Client, MessageAttachment } = require('discord.js');

const fs = require('fs');
const client = new Discord.Client()


var data;
fs.readFile('qotd.txt', 'utf8', function (err, rawData) {
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



client.once('ready', () => {
    console.log('chat bot is online!');
});

client.on("message", message => {
  if (message.content === "!talk qotd") {
    message.channel.send(getRandomLine());
  }
});

client.login('your bot key');

