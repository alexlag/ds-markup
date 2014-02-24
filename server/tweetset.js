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
			total = pos_total + neu_total + neg_total,
			pos = Tweets.find({creator: this.userId, polarity: 'positive'}).count(),
			neu = Tweets.find({creator: this.userId, polarity: 'neutral'}).count(),
			neg = Tweets.find({creator: this.userId, polarity: 'negative'}).count();
		var sum = Math.min(pos, pos_total) + Math.min(neu, neu_total) + Math.min(neg, neg_total);
		return {
			todo: total,
			pos_progress: pos + ' of ' + pos_total,
			neu_progress: neu + ' of ' + neu_total,
			neg_progress: neg + ' of ' + neg_total,
			sum_progress: sum + ' of ' + total,
			barpos: Math.floor(100.0 * pos / pos_total),
			barneu: Math.floor(100.0 * neu / neu_total),
			barneg: Math.floor(100.0 * neg / neg_total),
			pos_done: pos >= pos_total,
			neu_done: neu >= neu_total,
			neg_done: neg >= neg_total
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
})