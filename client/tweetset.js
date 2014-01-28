Accounts.ui._options.passwordSignupFields = "EMAIL_ONLY";

Meteor.subscribe('tweets');

displayAlert = function(message, type, timeout) {
	var div = $('#addingAlert');
	if(!type) type = 'info';
	div.attr('class', 'alert alert-' + type);
	div.html(message);

	div.show(400, function() {
		setTimeout(function() {
			div.hide(400);
		}, timeout);
	});
}

var parseAndAddTweet = function(polarity) {
	var inputSelector = '#input' + polarity.charAt(0).toUpperCase() + polarity.slice(1);
	addTweet({
		created: new Date().getTime(),
		text: $(inputSelector).val(),
		polarity: polarity
	});
	var res = Session.get('alert');
	displayAlert(res.message, res.alert, 2000);
	if(res.alert == 'success') 
		$(inputSelector).val('');
	return false;
}

Template.adding.events({
	'click #addPositive': function(e) {
		parseAndAddTweet('positive');
		e.preventDefault();
	},
	'keypress #inputPositive': function(e) {
		if(e.keyCode == 13) {
			parseAndAddTweet('positive');
			e.preventDefault();
		}
	},
	'click #addNeutral': function(e) {
		parseAndAddTweet('neutral');
		e.preventDefault();
	},
	'keypress #inputNeutral': function(e) {
		if(e.keyCode == 13) {
			parseAndAddTweet('neutral');
			e.preventDefault();
		}
	},
	'click #addNegative': function(e) {
		parseAndAddTweet('negative');
		e.preventDefault();
	},
	'keypress #inputNegative': function(e) {
		if(e.keyCode == 13) {
			parseAndAddTweet('negative');
			e.preventDefault();
		}
	}
})

Template.statistic.total = function() {
	var total = 50,
		pos = Tweets.find({creator: Meteor.userId(), polarity: 'positive'}).count(),
		neu = Tweets.find({creator: Meteor.userId(), polarity: 'neutral'}).count(),
		neg = Tweets.find({creator: Meteor.userId(), polarity: 'negative'}).count();
	var sum = pos + neu + neg
		max = Math.max(total, sum);
	return {
		'todo': total,
		'pos': pos,
		'neu': neu,
		'neg': neg,
		'sum': sum,
		'barpos': Math.floor(100.0 * pos / max),
		'barneu': Math.floor(100.0 * neu / max),
		'barneg': Math.floor(100.0 * neg / max)
	}
}

Template.recentTweetsTable.entries = function() {
	var cursor = Tweets.find({}, {sort: {created: -1}, limit: 10});
	return cursor.fetch()
}

Template.uncheckedTweetsTable.entries = function() {
	var cursor = Tweets.find({
		$and: [
			{ creator: { $ne: Meteor.userId()}},
			{ feedback: { $not: { $elemMatch: { user: Meteor.userId() } }}}
		]
	}, {sort: {created: -1}, limit: 10});
	return cursor.fetch();
}

Template.collaborate.uncheckedSize = function() {
	var size = Tweets.find({
		$and: [
			{ creator: { $ne: Meteor.userId()}},
			{ feedback: { $not: { $elemMatch: { user: Meteor.userId() } }}}
		]
	}).count();
	return size == 0 ? '' : size;
}

Template.checkedTweetsTable.entries = function() {
	var cursor = Tweets.find({
		$and: [
			{ creator: { $ne: Meteor.userId()}},
			{ feedback: { $elemMatch: { user: Meteor.userId() } }}
		]
	}, {sort: {created: -1}, limit: 10});
	return cursor.fetch();
}

Template.collaborate.checkedSize = function() {
	var size = Tweets.find({
		$and: [
			{ creator: { $ne: Meteor.userId()}},
			{ feedback: { $elemMatch: { user: Meteor.userId() } }}
		]
	}).count();
	return size == 0 ? '' : size;
}

Template.addedTweetsTable.entries = function() {
	var cursor = Tweets.find({ creator: Meteor.userId() });
	return cursor.fetch();
}

Template.collaborate.addedSize = function() {
	var size = Tweets.find({ creator: Meteor.userId() }).count();
	return size == 0 ? '' : size;
}

Template.tweetEntry.polarityClass = function() {
	switch(this.polarity) {
		case 'positive':
			return 'success';
		case 'negative':
			return 'danger';
		case 'neutral':
			return 'active';
	}
	return ''
}

Template.tweetEntry.events({
	'click .correctTweet': function(e) {
		Meteor.call('giveFeedback', this._id, true);
		e.preventDefault();
	},
	'click .incorrectTweet': function(e) {
		Meteor.call('giveFeedback', this._id, false);
		e.preventDefault();
	},
	'click .deleteTweet': function(e) {
		var result = confirm("Are you sure?");
		if (result == true) {
			Tweets.remove(this._id);
		}
		e.preventDefault();
	}
});

Template.tweetEntry.owner = function() {
	return this.creator === Meteor.userId();
}

var feedbackButtonState = function(e) {
	var feedback = e.feedback.filter(function(el) {
		return el.user === Meteor.userId();
	});
	if(feedback.length == 0) {
		return 0;
	} else {
		return feedback[0].isCorrect ? 1 : -1;
	}
}

Template.tweetEntry.feedbackCorrect = function() {
	return feedbackButtonState(this) == 1 ? 'success' : 'default';
}

Template.tweetEntry.feedbackIncorrect = function() {
	return feedbackButtonState(this) == -1 ? 'danger' : 'default';
}