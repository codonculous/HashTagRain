const express = require('express');
const http = require('http');
const path = require('path');
const keys = require('../config/keys');
const Twit = require('twit');
const socketIO = require('socket.io');
const publicPath = path.join(__dirname, '../client/');

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(publicPath));


//---------------------setting up keys to use twitter api-------------------------------
var T = new Twit({
  consumer_key:         keys.TWITTER_CONSUMER_KEY,
  consumer_secret:      keys.TWITTER_CONSUMER_SECRET,
  access_token:         keys.TWITTER_Access_Token,
  access_token_secret:  keys.TWITTER_Access_Token_Secret,
  timeout_ms:           60*1000  // optional HTTP request timeout to apply to all requests.
});

app.get('/admin',(res,rep) => {
  rep.sendFile(publicPath + 'views/admin.html');
});

app.get('/',(res,rep) => {
  rep.sendFile(publicPath + 'views/index.html');
});

var filter = {};
var currentUserHashtag;
var stream;


//---------------io listens on new socket connected on the client side ---------------------
io.on('connection',(socket) => {

  console.log(`New user connected, ${Date.now()}`);

  var userId;

  const fetchAndPostTwit = () => {

    // stop current streaming (if there is one) to update the filter
    if (stream) {
      stream.stop();
    }

    //start a streaming with a filter
    console.log('filter:',filter)
    stream = T.stream('statuses/filter', filter);

    //listen on new tweet
    stream.on('tweet', (tweet) => {
      console.log('new tweet, ', filter.track);

      // emit new tweet to front.
      io.to(userId).emit('newTwt',tweet);
    });

    //stop the stream when the socket is disconnected
    if (socket.id !== adminId) {
      socket.on('disconnect',() => {
        if (stream) {
          stream.stop();
        }
      });
    }
  }


  //-----------It listens the event that user submits the hashtag----------------------------
  socket.on('searchHashtag', (newHashtag) => {
    userId = socket.id;
    //Sanitize the user input
    newHashtag = newHashtag.trim();
    newHashtag = newHashtag.charAt(0) === '#' ? newHashtag : `#${newHashtag}`;

    //update the filter, user other than admin cannot add the location and username
    //therefore, hashtag can be saved to filter directly
    if (currentUserHashtag) {
      filter.track[filter.track.indexOf(currentUserHashtag)] = newHashtag;
    } else {
      filter['track'] ? filter['track'].push(newHashtag) : filter['track'] = [newHashtag];
    }
    currentUserHashtag = newHashtag;
    socket.emit('currentUserHashtag', currentUserHashtag);
    fetchAndPostTwit();

  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});