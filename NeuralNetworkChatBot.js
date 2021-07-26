// built by following this tutorial: https://www.youtube.com/watch?v=wypVcNIH6D4
// learn about natural language processing: https://blog.logrocket.com/natural-language-processing-for-node-js/
// learn about tensorflow/neural network: https://www.youtube.com/watch?v=XdErOpUzupY

var natural = require('natural');
// the tutorial uses nltk for nlp but because i'm in javaScript,
//  i used natural which is similar to nltk
var tf = require('@tensorflow/tfjs'); // using the name tf in place of tensorflow/tfjs
// i'll also use TensorFlow.js in place of TFLearn in python, the
//  tutorial also downloaded tensorflow for some reason!?
const fsNode = require('@tensorflow/tfjs-node');// for some reason, you need to install python 2.7 to use this

class NeuralNetworkChatBot {
    data;// intent data from a json file

    // it seems that in javaScript, you don't need to use the "let" or "function" keywords when declaring class fields and functions respectively
    words = []; // declare empty arrays
    labels = [];
    docs = [];// the video used two docs to store the pattern and its tag,
    //  i'm just gonna store it as a 2d array

    training = [];// data ready to be read by the neural network model
    output = [];
    trainingTensor;
    outputTensor;

    model = tf.sequential();// our neural network model

    // create a tokenizer to be able to tokenize in certain functions
    #tokenizer = new natural.WordTokenizer;//fields in javascript are public by default, use # to signal that the field is private

    constructor() {
    }

    // setupDataFromFile: sets up key data (words, labels, docs) for chat bot neural network
    // requires: data is valid
    #setupDataFromIntents() {
        for (let intent in this.data["intents"]) {// for in loop in javaScript (simplified for loop)
            // in JS for in loops, the variable DISPLAYS the index
            // of item instead of its value, unlike python
            for (let pattern in this.data["intents"][intent]["patterns"]) {
                let wrds = this.#tokenizer.tokenize(this.data["intents"][intent]["patterns"][pattern]);
                for (let w in wrds) {
                    wrds[w] = natural.PorterStemmer.stem(wrds[w].toLowerCase());
                }// stem each word in wrds and convert them to lower case, the video did it later which is rather not good
                wrds = wrds.filter((word) => (word != '?'));// filters ?s out
                this.words.push(...wrds);// replacement for words.extend(wrds) in python
                //the operator "..." spreads elements of an array into separate arguments for a function
                this.docs.push([wrds, this.data["intents"][intent]["tag"]]);// replacement for append in python
            }

            if (!(this.data["intents"][intent]["tag"] in this.labels)) {
                this.labels.push(this.data["intents"][intent]["tag"]);
            }// add a label if it's not already in labels
        }

        let wordsWODuplicates = (Array.from(new Set(this.words))).sort();
        this.words.splice(0, this.words.length);
        this.words.push(...wordsWODuplicates);//doing it in this weird way instead of just assigning the set to words because it's a reference type
        //words = (Array.from(new Set(words))).sort();
        // convert words to set to remove duplicates then convert it back, then sort it
        // javascript has set support just like python!!

        this.labels.sort();// sort our labels
    }

    // setupModelData: setup the training and output, trainingTensor, outputTensor data for the neural network
    // requires: docs, words, labels are valid
    #setupModelData() {
        for (let i in this.docs) {
            // the horror of globals: in loose-mode javaScript, writing variables without the "let", "const" keywords
            // don't trigger an error, instead, it is an implcit assignment to a (New) property on the global object
            // (which you can access as window on browsers). in other words, it creates a global variable. this is why
            // "for (i in docs)" worked outside of the class. it doesn't work in a class because it's not valid to declare
            // a global variable inner the class scope, so you have to use (let i in docs) here
            let bag = [];

            let wrds = this.docs[i][0];

            for (let w in this.words) {
                if (wrds.includes(this.words[w])) {
                    bag.push(1);
                } else {
                    bag.push(0);
                }
            }// translates our pattern to a bag of words so the neural network understands

            //console.log(wrds);
            //console.log(bag);

            let out = [];
            out.length = this.labels.length;
            out.fill(0);
            out[this.labels.indexOf(this.docs[i][1])] = 1;// translates our tag to 0 and 1s so neural network understands

            //console.log(docs[i][1]);
            //console.log(out);

            this.training.push(bag);
            this.output.push(out);

            // convert training, output to a format that tensorFlow loves
            this.trainingTensor = tf.tensor2d(this.training);
            this.outputTensor = tf.tensor2d(this.output);
        }
    }

    // setupData: sets up words, labels, docs, training, and output
    // requires: intents must follow a specific format, check out the example json file in the directory
    setupData(intents) {
        this.data = intents;
        //console.log(this.data["intents"]); // reading the file is working as expected

        // initialize our neural network data from our data in json file
        //  part of it is to tokenize each pattern
        this.#setupDataFromIntents();

        //console.log(words);// test code for converting data
        //console.log(labels);
        //console.log(docs);

        // get data ready to feed into our model: patterns converted to bags of words, and
        //  corresponding response for pattern (the tag it points to)
        //  now, neural networks only understand numbers, so we have to convert our strings to numbers
        this.#setupModelData();

        //console.log(training);// test code for translations for neural network speak
        //console.log(output);
    }

    // wordsToBag(message): converts a message to a bag of words and returns the bag
    // requires: words is valid
    #wordsToBag(message) {
        let bag = [];
        bag.length = this.words.length;
        bag.fill(0);

        let mWords = this.#tokenizer.tokenize(message);
        for (let w in mWords) {
            mWords[w] = natural.PorterStemmer.stem(mWords[w].toLowerCase());
        }
        mWords = mWords.filter((word) => (word != '?'));// convert message to tokenized stemmed array of words

        for (let mWord in mWords) {
            for (let w in this.words) {
                if (this.words[w] == mWords[mWord]) {
                    bag[w] = 1;
                }
            }
        }

        //console.log(bag); // test code

        //return tf.tensor(bag);
        return bag;
    }

    // setupModel: sets up the layers of the model
    // requires: training and output are valid
    setupModel() {
        this.model.add(tf.layers.dense({
            inputShape: [this.training[0].length],
            units: 8,
        }));// dense essentially means "fully connected"
        // specifying inputShape is optional except in the first layer
        this.model.add(tf.layers.dense({
            units: 8,
        }));
        this.model.add(tf.layers.dense({
            activation: "softmax",
            units: this.output[0].length,
        }));
        this.model.compile({
            loss: "meanSquaredError",
            optimizer: tf.train.adam(0.06),
        })
    }

    // trainModel: trains our model and saves our model to ./TFModel
    // requires: model, trainingTensor and outputTensor are all valid
    async trainModel() {
        await this.model.fit(this.trainingTensor, this.outputTensor, { epochs: 1000, verbose: 0/*, batchSize: 8, showMetric: true*/ });// have to use await and async function for this
        // otherwise the predictions WILL NOT work correctly!!!!
    }

    // saveModel: saves the model to the current directory
    // requires: model is valid and has been trained
    async saveModel(path) {
        await this.model.save(path);// only works when you require tfjs-node
    }

    // loadModel: loads a model that's already valid and trained
    // notes: for some reason, the documentation shows that you pass the same
    //  path that you pass to save the model, however, you actually have
    //  to go into that path and specify the model.json inside that path.
    //  e.x. use 'file://./TFModel/model.json' instead of 'file://./TFModel'
    async loadModel(path) {
        this.model = await tf.loadLayersModel(path);
    }

    // either loads an existing model or trains a model and saves it. i have to
    //  write all this code in a function because of the weird way that async
    //  stuff run in javaScript
    // asynchronous stuff in javascript is just driving me nuts
    // model.fit, model.save, tf.loadLayersModel are all async functions, this is driving me nuts
    // how asynchronous vs synchronous stuff work: basically, asynchronous stuff is set aside whereas
    // synchronous stuff is executed one by one procedurally. more explanation: https://www.youtube.com/watch?v=Q-Zmc0E0GYY
    // Await expressions make promise-returning functions behave as though they're synchronous by suspending execution until the returned promise is fulfilled or rejected
    async furtherSetupModel(path) {
        try {
            await this.loadModel(path + '/model.json');
            console.log("try loading model successful");
        } catch (err) {
            console.log("try loading model unsuccessful");
            await this.trainModel();// train/fit our neural network
            await this.saveModel(path);// saves our trained neural network
        }
        return "promise has returned";
    }

    // chat(message): consumes a message and spits out a response
    // notes: convert the message into a bag of words then
    //  feed it to the model then get the model's response
    // requires: model, words, labels, data are all valid.
    //           model must be already trained
    chat(message) {
        let result = this.model.predict(tf.tensor2d([this.#wordsToBag(message, this.words)]));
        console.log(result.print());

        // we pass an array because predict actually expects an array of messages
        result = result.arraySync()[0];// convert back to javaScript 2d array, then 1d since we only have one entry
        let result_index = result.indexOf(Math.max(...result));// Return index of greatest value in an array
        if (result[result_index] > 0.7) {// goes with the response only if the bot is 0.7 confident about the best probable answer
            let result_tag = this.labels[result_index];
            console.log(result_tag);

            let responses = [];
            for (let tag in this.data['intents']) {
                if (this.data['intents'][tag]['tag'] == result_tag) {
                    responses = this.data['intents'][tag]['responses'];
                }
            }
            let random_index = Math.floor(Math.random() * responses.length);// pick a random response
            return responses[random_index];
        } else {
            console.log("don't understand message");
            return "what are you talking about?";
        }
    }
}

module.exports = NeuralNetworkChatBot;
// how modules, importing work in javaScript: you have write export for things you want to export so
//  that they are available to files outside. in the client, you import the file
// import vs require: https://stackoverflow.com/questions/46677752/the-difference-between-requirex-and-import-x
// require & module.exports: https://www.youtube.com/watch?v=pP4kjXykbio
// import & export: https://www.youtube.com/watch?v=cRHQNNcYf6s

// example usage of this class:
// import the class: var NeuralNetworkChatBot = require("./NeuralNetworkChatBot");

// setup chatBot
/*let chatBot = new NeuralNetworkChatBot();// reads intents from our folder
chatBot.setupData(require('./intents.json'));// setup all data for our neural network model, intents is extracted from a json file
chatBot.setupModel();
chatBot.furtherSetupModel('file://./TFModel').then(testChatBot);// now we will build our model/neural network
// i'm doing it in this weird way using "then" because furtherSetupModel has to be async
// for then statement to work properly, you should pass in the name of the function, or the function's definition
// and not a application of the function, for more info, see test.js

// testing chatBot
function testChatBot () {
    console.log(chatBot.chat("how are you"));
}*/