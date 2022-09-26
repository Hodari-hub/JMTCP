const needle = require('needle');
const twit = require('twit');
const ApiKey ="4KULNS3M12bzLuCY0HXdfRviI";
const ApiSecret = "6HqOXj9xEhjNQk8WQjGrW7nSibHEZCxiSzVAnpjOflANlFjgnK";
const AccessToken = "1520442987758731266-5smoyEDkvxzGz8ZekdqyKzwhODc1DF";
const AccessSecret = "q1cWxUt34loEhEzuhJT1q39bsxQ6tWW9qYNFzpqNEcC0A";
const BareToken = "AAAAAAAAAAAAAAAAAAAAAGqLggEAAAAAkcQAKHizdE3jzFfMYsnlRafDpRE%3DeYW8OKoNoqgnPiV9Wa9p2Stew1V4l08vwOhPsSH2w7tcsX6DQj";
const keyword=["mafuta","gesi","umeme","makamba","wizara ya nishati","january makamba"];
/* 
  JMTCP, bronxe.360@gmail.com
  BOT NAME: twitter 
  password:#Ushindi@123
*/

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL ='https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id,in_reply_to_user_id,referenced_tweets.id';

// Get stream rules
async function getRules() {
  const response = await needle('get', rulesURL, { headers: {Authorization: `Bearer ${BareToken}`,},})
  return response.body;
}

// Set stream rules
async function setRules() {
  const data = { add: [{value: "mafuta" },{value: "gesi" },{value: "umeme"},{value: "makamba"},{value: "wizara ya nishati"},{value: "january makamba"}],}
  const response = await needle('post', rulesURL, data, { headers: {'content-type': 'application/json', Authorization: `Bearer ${BareToken}`,},});
  return response.body;
}

//retweet the content
var retweet=(tweet_id)=>{
  let T = new twit({consumer_key:ApiKey,consumer_secret:ApiSecret,access_token:AccessToken,access_token_secret:AccessSecret});
  T.post('statuses/retweet/:id', { id: tweet_id }, function(error, data, response){ if(error){console.log(`Error from retweet ${error}`, data, response);} });
}

// Delete stream rules
async function deleteRules(previusrule) {
  if (!Array.isArray(previusrule.data)) {return null}
  const ids = previusrule.data.map((rule) => rule.id);
  const data = {delete: {ids: ids,},}
  const response = await needle('post', rulesURL, data, {headers: {'content-type': 'application/json',Authorization: `Bearer ${BareToken}`,},});
  return response.body
}

function streamTweets() {
    const stream = needle.get(streamURL, {headers: {Authorization: `Bearer ${BareToken}`,},})
    stream.on('data', (data) => {
        try {
          if(JSON.parse(data)){
            const json = JSON.parse(data);
            let isRt= json.data.text.substring(0,2).toString()=="RT";
            let isReply= "in_reply_to_user_id" in json.data;
            //retweet only tweets, not replies or retweets
            if(!isReply && !isRt){
              for(let i =0; i<keyword.length; i++){
                //check if the string contain keyword match in our array 
                if(json.data.text.toLowerCase().includes(keyword[i].toLowerCase())){retweet(json.data.id);}
              }
            }
          }
          else{console.log(data);}
        } 
        catch (error){console.log(`Error from streaming, ${error}`);}
    });
    return stream;
}


var initialize_rules= async ()=>{
    let currentRules;
    try {
      //Get all stream rules
      currentRules = await getRules();
      // Delete all stream rules
      await deleteRules(currentRules);
      // Set rules based on array above
      await setRules();
      //then call the stream function
      streamTweets();
    } 
    catch(error){console.log(`Error from initialization ${error}`);}
}

//run the function
initialize_rules();



