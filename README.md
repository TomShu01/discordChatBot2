# discordChatBot

if you want to run this code, you won't be using our application token and thus wouldn't be the same bot as ours
but it will have the same functionality, you cna use our bot by inviting it to your server using the link below, however
whether it goes online depends on whether our dev team decides to run it on our own computers
don't send this token to anybody, replace with something else before you share with anyone

talk: the core function of chatbot. takes in a message and outputs a response
examples: "hey chatbot" "what's up!"; "hello chatbot" "hi ya"
"i am lonely" "hey, i'm here bro"; "i'm kinda sad" "you are not"
"bro what you be doing bro?" "you know, maybe it's not because your english teacher sucks"

maybe we'll make three modules
1. chat module: takes in a message and spits out a response
2. speech to text: converts speech in VC to text (using google's speech api)
3. text to speech: converts the response from chat module to voice (probably using another api)

commands to take in (we are planning to implement this feature):

1. !talk [string]: talks to chatbot with words and chatbot will respond
2. !changePersona [string]: chatbot changes its persona to designated personality
3. !changeTone [string]: chatbot changes its tone to designated tone
4. !enableVC [bool]: chatbot enables/disables VC based on the bool passed in