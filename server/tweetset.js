Meteor.publish("tweets", function () {
	return Tweets.find({}, {sort: {created: -1}});
});