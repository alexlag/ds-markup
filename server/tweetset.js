Meteor.publish("tweets", function () {
	if(this.userId) {
		return Tweets.find({}, {});
	} else {
		return Tweets.find('0');
	}

});