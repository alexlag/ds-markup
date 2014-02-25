Meteor.startup(function() {
	Tweets.find().observe({
		added: broadcastChange,
		removed: broadcastChange,
		changed: broadcastChange
	})
});

var broadcastChange = function() {
	Broadcast.update({_id: 1}, {$set: {m: Random.id()}})
}

Meteor.publish("recentTweets", function() {
	if(this.userId) {
		return Tweets.find({}, {sort: {created: -1}, limit: 10});
	}
})

Meteor.publish("uncheckedTweets", function(limit, skip) {
	if(this.userId) {
		return Tweets.find({
			$and: [
				{ creator: { $ne: this.userId}},
				{ feedback: { $not: { $elemMatch: { user: this.userId } }}}
			]
		}, {sort: {created: 1}, skip: skip, limit: limit});
	}
})

Meteor.publish("checkedTweets", function(limit, skip) {
	if(this.userId) {
		return Tweets.find({
			$and: [
				{ creator: { $ne: this.userId}},
				{ feedback: { $elemMatch: { user: this.userId } }}
			]
		}, {sort: {created: -1}, skip: skip, limit: limit});
	}
})

Meteor.publish("addedTweets", function(limit, skip) {
	if(this.userId) {
		return Tweets.find({ creator: this.userId}, {sort: {created: -1}, skip: skip, limit: limit});
	}
})

Meteor.methods({
	'getUserStatistics': function() {
		var pos_total = 25, neu_total = 50, neg_total = 25,
			pos = Tweets.find({creator: this.userId, polarity: 'positive'}).count(),
			neu = Tweets.find({creator: this.userId, polarity: 'neutral'}).count(),
			neg = Tweets.find({creator: this.userId, polarity: 'negative'}).count();
		return {
			pos_total: pos_total,
			neu_total: neu_total,
			neg_total: neg_total,
			pos: pos,
			neu: neu,
			neg: neg
		}
	},
	'getUserBadges': function() {
		var unchecked = Tweets.find({
				$and: [
					{ creator: { $ne: this.userId}},
					{ feedback: { $not: { $elemMatch: { user: this.userId } }}}
				]
			}, {}).count(),
			checked = Tweets.find({
				$and: [
					{ creator: { $ne: this.userId}},
					{ feedback: { $elemMatch: { user: this.userId } }}
				]
			}, {}).count(),
			added = Tweets.find({ creator: this.userId}, {}).count();
		return {
			unchecked: unchecked,
			checked: checked,
			added: added
		}
	}
});

Meteor.publish("broadcast", function() {
	if(this.userId) {
		return Broadcast.find();
	}
})