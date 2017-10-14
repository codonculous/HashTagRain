const streamOn = (stream) => {
  if (stream && stream.parser._events.element) {
    // streaming is going
    return 1;
  } else if (stream){
    // streaming stopped
    return 2;
  } else {
    // user never searched any hashtag
    return 3;
  }
};

const filter_logic = (tweet, rawFilter) => {

  //check for location match
  if (rawFilter.location && rawFilter.location.length > 0 && tweet.user.location ) {
    var breaked = false;
    for (let j = 0; j < rawFilter.location.length; j++) {
      if (tweet.user.location.toLowerCase().includes(rawFilter.location[j].toLowerCase())) {
        breaked = true;
        break;
      }
    }

    if (!breaked) {
      return false;
    }
  }

  //check for hashtag match
  if (rawFilter.track && rawFilter.track.length > 0) {
    if (tweet.entities.hashtags.length === 0) {
      return false;
    }

    var breaked = false;
    for (let hi = 0; hi < tweet.entities.hashtags.length; hi ++) {
      for (let hj = 0; hj < rawFilter.track.length; hj++) {
        if (rawFilter.track[hj].toLowerCase() == `#${tweet.entities.hashtags[hi].text.toLowerCase()}` ) {
          breaked = true;
          break;
        }
      }
    }
    if (!breaked) {
      return false;
    }
  }

  //check for screen_name match
  if (rawFilter.follow && rawFilter.follow.length > 0 && tweet.user.screen_name ) {
    var breaked = false;
    for (let fj = 0; fj < rawFilter.follow.length; fj++) {
      if (rawFilter.follow[fj].toLowerCase() == tweet.user.screen_name.toLowerCase()) {
        breaked = true;
        break;
      }
    }

    if (!breaked) {
      return false;
    }
  }
  return true;
};

//descide if a tweet belong to a user
//check if the tweeter contain the hashtags user is looking for
const myTweet = (tweet, userId, userList) => {
  for (let i = 0; i < tweet.entities.hashtags.length; i++) {
    if (`#${tweet.entities.hashtags[i].text.toLowerCase()}` === userList[userId].toLowerCase()) {
      return true;
    }
  }
  return false;
};

module.exports = { streamOn, filter_logic, myTweet };