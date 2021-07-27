# discordChatBot
discord chat bot: a discord bot for people to chat with when they get lonely

talk: the core function of chatbot. takes in a message and outputs a response
examples: "hey chatbot" "what's up!"; "hello chatbot" "hi ya"
"i am lonely" "hey, i'm here bro"; "i'm kinda sad" "you are not"
"bro what you be doing bro?" "you know, maybe it's not because your english teacher sucks"

notes: if you want to run this code, you won't be using our application token and thus wouldn't be the same bot as ours
but it will have the same functionality, you cna use our bot by inviting it to your server using the link below, however
whether it goes online depends on whether our dev team decides to run it on our own computers
don't send this token to anybody, replace with something else before you share with anyone

notes: for some reason, the bot is making some very inaccurate, high confidence predictions for some inputs.
It also sometimes get stuck in predicting and i have to ctrl C to exit it, i don't know why

notes: the bot is now hosted on heroku 24/7 through github

list of all features planned:
1. chat module: takes in a message and spits out a response
2. speech to text: converts speech in VC to text (using google's speech api)
3. text to speech: converts the response from chat module to voice (probably using another api)
4. self-learning: not practical
5. have a persona
6. change persona
7. random talks module
8. talk only when mentioned in @ (or "bot" included in message)
9. better node.js interface
10. small changes: ask user to enter bot key

features implemented/added:
1. chat module
2. random talks module
3. talk only when "bot" included in message

commands to take in (we are planning to implement this feature):

1. start talking bot: enables random talking
2. shut up bot: disables random talking
3. !changePersona [string]: chatbot changes its persona to designated personality
4. !changeTone [string]: chatbot changes its tone to designated tone
5. !enableVC [bool]: chatbot enables/disables VC based on the bool passed in