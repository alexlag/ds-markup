Meteor.publish("tweets", function () {
	if(this.userId) {
		return Tweets.find({}, {});
	}
});