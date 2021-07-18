const discord = require('discord.js'); // kinda like importing discord library in C
// Discord.js is a powerful node.js module that allows you to interact with the Discord API much easier

// built by following this tutorial: https://www.youtube.com/watch?v=wypVcNIH6D4
// learn about natural language processing: https://blog.logrocket.com/natural-language-processing-for-node-js/
// learn about tensorflow/neural network: https://www.youtube.com/watch?v=XdErOpUzupY

//neural network stuff
const fs = require('fs');
const fsNode = require('@tensorflow/tfjs-node');
var natural = require('natural');
var tf = require('@tensorflow/tfjs');

const data = require('./intents.json');// reads intents from our folder
const { tensor2d } = require('@tensorflow/tfjs');
const { exception } = require('console');

//console.log(data["intents"]); // reading the file is working as expected

let words = []; // declare empty arrays
let labels = [];
let docs = [];// the video used two docs to store the pattern and its tag,
//  i'm just gonna store it as a 2d array

// dataSetup (data, words, labels, docs): sets up key data (words, labels, docs) for chat bot neural network
function dataSetup(data, words, labels, docs) {
    for (let intent in data["intents"]) {// for in loop in javaScript (simplified for loop)
        // in JS for in loops, the variable DISPLAYS the index
        // of item instead of its value, unlike python
        for (let pattern in data["intents"][intent]["patterns"]) {
            let wrds = tokenizer.tokenize(data["intents"][intent]["patterns"][pattern]);
            for (let w in wrds) {
                wrds[w] = natural.PorterStemmer.stem(wrds[w].toLowerCase());
            }// stem each word in wrds and convert them to lower case, the video did it later which is rather not good
            wrds = wrds.filter((word) => (word != '?'));// filters ?s out
            words.push(...wrds);// replacement for words.extend(wrds) in python
            //the operator "..." spreads elements of an array into separate arguments for a function
            docs.push([wrds, data["intents"][intent]["tag"]]);// replacement for append in python
        }

        if (!(data["intents"][intent]["tag"] in labels)) {
            labels.push(data["intents"][intent]["tag"]);
        }// add a label if it's not already in labels
    }

    let wordsWODuplicates = (Array.from(new Set(words))).sort();
    words.splice(0, words.length);
    words.push(...wordsWODuplicates);//doing it in this weird way instead of just assigning the set to words because it's a reference type
    //words = (Array.from(new Set(words))).sort();
    // convert words to set to remove duplicates then convert it back, then sort it
    // javascript has set support just like python!!

    labels.sort();// sort our labels
}

// wordsToBag: converts a message to a bag of words
function wordsToBag(message, words) {
    let bag = [];
    bag.length = words.length;
    bag.fill(0);

    let mWords = tokenizer.tokenize(message);
    for (let w in mWords) {
        mWords[w] = natural.PorterStemmer.stem(mWords[w].toLowerCase());
    }
    mWords = mWords.filter((word) => (word != '?'));// convert message to tokenized stemmed array of words

    for (let mWord in mWords) {
        for (let w in words) {
            if (words[w] == mWords[mWord]) {
                bag[w] = 1;
            }
        }
    }

    //console.log(bag); // test code

    //return tf.tensor(bag);
    return bag;
}

// setupModelData: setup the training and output data for the neural network
function setupModelData(docs, words, labels, training, output) {
    for (i in docs) {
        let bag = [];

        let wrds = docs[i][0];

        for (w in words) {
            if (wrds.includes(words[w])) {
                bag.push(1);
            } else {
                bag.push(0);
            }
        }// translates our pattern to a bag of words so the neural network understands

        //console.log(wrds);
        //console.log(bag);

        let out = [];
        out.length = labels.length;
        out.fill(0);
        out[labels.indexOf(docs[i][1])] = 1;// translates our tag to 0 and 1s so neural network understands

        //console.log(docs[i][1]);
        //console.log(out);

        training.push(bag);
        output.push(out);
    }
}

// create a tokenizer to be able to tokenize in certain functions
var tokenizer = new natural.WordTokenizer;

// initialize our neural network data from our data in json file
//  part of it is to tokenize each pattern
dataSetup(data, words, labels, docs);

//console.log(words);// test code for converting data
//console.log(labels);
//console.log(docs);

// get data ready to feed into our model: patterns converted to bags of words, and
//  corresponding response for pattern (the tag it points to)
//  now, neural networks only understand numbers, so we have to convert our strings to numbers
let training = [];
let output = [];

setupModelData(docs, words, labels, training, output);

//console.log(training);// test code for translations for neural network speak
//console.log(output);

// convert training, output to a format that tensorFlow loves
const trainingTensor = tf.tensor2d(training);
const outputTensor = tf.tensor2d(output);

// now we will build our model/neural network
let model = tf.sequential();

model.add(tf.layers.dense({
    inputShape: [training[0].length],
    units: 8,
}));// dense essentially means "fully connected"
// specifying inputShape is optional except in the first layer
model.add(tf.layers.dense({
    units: 8,
}));
model.add(tf.layers.dense({
    activation: "softmax",
    units: output[0].length,
}));
model.compile({
    loss: "meanSquaredError",
    optimizer: tf.train.adam(0.06),
})

// chat: consumes a message and spits out a response
// notes: convert the message into a bag of words then
//  feed it to the model then get the model's response
function chat(message) {
    let result = model.predict(tf.tensor2d([wordsToBag(message, words)]));
    console.log(result.print());

    // we pass an array because predict actually expects an array of messages
    result = result.arraySync()[0];// convert back to javaScript 2d array, then 1d since we only have one entry
    let result_index = result.indexOf(Math.max(...result));// Return index of greatest value in an array
    let result_tag = labels[result_index];
    console.log(result_tag);

    let responses = [];
    for (tag in data['intents']) {
        if (data['intents'][tag]['tag'] == result_tag) {
            responses = data['intents'][tag]['responses'];
        }
    }
    let random_index = Math.floor(Math.random() * responses.length);// pick a random response
    return responses[random_index];
}

// train/fit our neural network
model.fit(trainingTensor, outputTensor, { epochs: 200, verbose: 0/*, batchSize: 8, showMetric: true*/ })
    .then(runDiscordBot());// have to use await and async function for this
// otherwise the predictions WILL NOT work correctly!!!!

function runDiscordBot() {
    const client = new discord.Client(); //creates our discord bot

    const prefix = '!'; //command prefix is "!". e.x. !talk

    client.once('ready', () => {
        console.log('chat bot is online!');
    });// from what i understand, an arrow function works like lambda or anonymous functions in racket

    // response to command
    client.on('message', message => {
        if (message.author.bot) {
            return;
        }// bot doesn't react to commands
        //message.channel.send('hey!');

        message.channel.send(chat(message.content));
    });

    client.login('add your discord bot application token here');// login to our bot, keep this line at the end of file!!!
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

