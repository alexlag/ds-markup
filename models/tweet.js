Tweets = new Meteor.Collection('tweets');

Tweets.allow({
	insert: function (userId, tweet) {
		return false;
	},
	update: function (userId, tweet, fields, modifier) {
		return false;
	},
	remove: function (userId, tweet) {
		return false;
	}
});

addTweet = function(options) {
	options.text = options.text.trim();
	Meteor.call('addTweet', options);
}

Meteor.methods({
	addTweet: function(options){
		var id = Random.id();

		if (options.text.length < 10) {
			if(Meteor.isClient)
				Session.set('alert', { 
					alert: 'danger', 
					message: 'That was boring, gimme more'
				});
			return id;
		}
		if (options.text.replace(/(https?:\/\/)\S+/g,"").length > 160) {
			if(Meteor.isClient)
				Session.set('alert', { 
					alert: 'danger',
					message: 'Tweet is too long'
				});
			return id;
		}
		if (oldTweet(options.text)) {
			if(Meteor.isClient)
				Session.set('alert', { 
					alert: 'danger', 
					message: 'Similar tweet was added before'
				});
			return id;
		}
		if (!this.userId)
			throw new Meteor.Error(403, 'You must be logged in');

		if(Meteor.isServer) {
			Tweets.insert({
				_id: id,
				created: new Date().getTime(),
				creator: this.userId,
				text: options.text,
				polarity: options.polarity,
				feedback: []
			});
		}
		if(Meteor.isClient)
			Session.set('alert', { 
				alert: 'success', 
				message: 'Tweet was added'
			});
		return id;
	},
	removeTweet: function(id) {
		if(Meteor.isServer) {
			Tweets.remove({_id: id, creator: this.userId});
		}
	},
	giveFeedback: function(tweetId, isCorrect) {
		var tweet = Tweets.findOne(tweetId);
		var feedbackIndex = _.indexOf(_.pluck(tweet.feedback, 'user'), this.userId);
		if( feedbackIndex !== -1 ) {
			if (Meteor.isServer) {
				Tweets.update(
					{_id: tweetId, "feedback.user": this.userId},
					{$set: {"feedback.$.isCorrect": isCorrect}});
			} else {
				var modifier = {$set: {}};
				modifier.$set["feedback." + feedbackIndex + ".isCorrect"] = isCorrect;
				Tweets.update(tweetId, modifier);
			}
		} else {
			Tweets.update(tweetId, {$push: {feedback: {user: this.userId, isCorrect: isCorrect}}});
		}
	},
	jobDone: function() {
		if(Meteor.user &&
			Tweets.find({creator: Meteor.userId(), polarity: 'neutral'}).count() >= 50 &&
			Tweets.find({creator: Meteor.userId(), polarity: 'positive'}).count() >= 25 &&
			Tweets.find({creator: Meteor.userId(), polarity: 'negative'}).count() >= 25)
			return true;
		return false;
	}
});

var oldTweet = function(text) {
	var tweets = Tweets.find({}, {fields: {text: 1}}).fetch();
	var index = tweets.length;
	var firstSample = text.replace(/(https?:\/\/)\S+/g,"").toLowerCase(), secondSample;
	while(index--) {
		secondSample = tweets[index].text.replace(/(https?:\/\/)\S+/g,"").toLowerCase();
		if(getEditDistance(firstSample, secondSample) < 10) {
			return true;
		}
	}
	return false;
}

var getEditDistance = function(a, b){
	if(a.length === 0) return b.length; 
	if(b.length === 0) return a.length; 

	var matrix = [];

	// increment along the first column of each row
	var i;
	for(i = 0; i <= b.length; i++){
		matrix[i] = [i];
	}

	// increment each column in the first row
	var j;
	for(j = 0; j <= a.length; j++){
		matrix[0][j] = j;
	}

	// Fill in the rest of the matrix
	for(i = 1; i <= b.length; i++){
		for(j = 1; j <= a.length; j++){
			if(b.charAt(i-1) === a.charAt(j-1)) {
				matrix[i][j] = matrix[i-1][j-1];
			} else {
				matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
				Math.min(matrix[i][j-1] + 1, // insertion
				matrix[i-1][j] + 1)); // deletion
			}
		}
	}

	return matrix[b.length][a.length];
};