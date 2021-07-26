const discord = require('discord.js'); // kinda like importing discord library in C
// Discord.js is a powerful node.js module that allows you to interact with the Discord API much easier

// built by following this tutorial: https://www.youtube.com/watch?v=wypVcNIH6D4
// learn about natural language processing: https://blog.logrocket.com/natural-language-processing-for-node-js/
// learn about tensorflow/neural network: https://www.youtube.com/watch?v=XdErOpUzupY

var NeuralNetworkChatBot = require("./NeuralNetworkChatBot");//// import our neural network chat bot
var getRandomLine = require('./qotd module/qotd.js');// import our random talking function

// setup chatBot
let chatBot = new NeuralNetworkChatBot();// reads intents from our folder
chatBot.setupData(require('./intents.json'));// setup all data for our neural network model, intents is extracted from a json file
chatBot.setupModel();
chatBot.furtherSetupModel('file://./TFModel').then(runDiscordBot);// now we will build our model/neural network

let randomTalksOn = false; // keeps track of whether random talks is on. i'd hate to use global variables
// but this is probably the simplest solution for toggling random talking

// bot talks randomly once in a while
async function randTalks(channel) {
    channel.send("sure, bro. let's talk");
    while (true) {
        if (!randomTalksOn) {
            channel.send("alright, lmao");
            break;
        }

        await new Promise((resolve, reject) => {
            setTimeout(function () {
                channel.send(getRandomLine());
                console.log("talking randomly");
                resolve('foo'); }, 1000 * 10)
        });
    }
}

function runDiscordBot() {
    const client = new discord.Client(); //creates our discord bot

    const prefix = '!'; //command prefix is "!". e.x. !talk

    client.once('ready', () => {
        console.log('chat bot is online!');
    });// from what i understand, an arrow function works like lambda or anonymous functions in racket

    // response to command
    client.on('message', message => {
        if ((!message.content.includes("bot")) || message.author.bot) {
            return;
        } // bot won't do anything if the message doesn't contain "bot" or is sent by a bot
        // could've used a discord mention as cue for bot to talk, but then decided that
        // it's too clunky to use, on the other word, just typing bot in your message
        // is a way nicer solution

        if (message.content === 'start talking bot') {
            randomTalksOn = true;
            randTalks(message.channel); // bot talks randomly every 3 seconds
            return;
        } else if (message.content === 'shut up bot') {
            randomTalksOn = false;
            return;
        }// toggle random talking

        message.channel.send(chatBot.chat(message.content));
    });

    /*client.on('message', message =>{
        if (!message.content.startsWith(prefix) || message.author.bot) {
            return;
        }
        const args = message.content.slice(prefix.length).split(/ +/);// args is an array
        const command = args.shift().toLowerCase();
    
        if(command === 'talk') {
            message.channel.send('hey!');
    
            if (args[0] === 'HowAreYou?') {
                message.channel.send('good, not great');
            } else if (args[0] === 'tellAJoke') {
                message.channel.send('you, hahahahaha');
            } else if (args[0] === 'WhoAreYou?') {
                message.channel.send('i am chat bot, and im here to chat with you');
            }
        }
    });*/

    client.login('enter your bot key');// login to our bot, keep this line at the end of file!!!
    // if you want to run this code, you won't be using our application token and thus wouldn't be the same bot as ours
    // but it will have the same functionality, you cna use our bot by inviting it to your server using the link below, however
    // whether it goes online depends on whether our dev team decides to run it on our own computers
    // don't send this token to anybody, replace with something else before you share with anyone
}

// talk: the core function of chatbot. takes in a message and outputs a response
// examples: "hey chatbot" "what's up!"; "hello chatbot" "hi ya"
//  "i am lonely" "hey, i'm here bro"; "i'm kinda bummed" "you are a bum"
// "bro what you be doing bro?" "you know, maybe it's not because your english teacher sucks"
// readings: https://en.wikipedia.org/wiki/English_grammar#Clause_and_sentence_structure
//  https://www.englishclub.com/grammar/questions.htm

// extra notes:
// token on discord developer portal allows our app on our pc
//  to access the application on discord

// link to add bot to server: https://discord.com/oauth2/authorize?client_id=865792256023199745&scope=bot&permissions=7754743361

