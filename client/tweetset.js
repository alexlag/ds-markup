Accounts.ui._options.passwordSignupFields = "EMAIL_ONLY";

Meteor.subscribe('tweets');

Meteor.startup(function() {
	Session.set('selectedTab', 'recentTweets');
});

window.saveAs || ( window.saveAs = (window.navigator.msSaveBlob ? function(b,n){ return window.navigator.msSaveBlob(b,n); } : false) || window.webkitSaveAs || window.mozSaveAs || window.msSaveAs || (function(){
	window.URL || (window.URL = window.webkitURL);
	if(!window.URL){
		return false;
	}
	return function(blob,name){
		var url = URL.createObjectURL(blob);
		if( "download" in document.createElement('a') ){
			var a = document.createElement('a');
			a.setAttribute('href', url);
			a.setAttribute('download', name);
			var clickEvent = document.createEvent ("MouseEvent");
			clickEvent.initMouseEvent ("click", true, true, window, 0, 
				0, 0, 0, 0,
				false, false, false, false,
				0, null);
			a.dispatchEvent (clickEvent);
		}
		else{
			window.open(url, '_blank', '');
		}
	};
})() );

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
	var pos_total = 25, neu_total = 50, neg_total = 25,
		total = pos_total + neu_total + neg_total,
		pos = Tweets.find({creator: Meteor.userId(), polarity: 'positive'}).count(),
		neu = Tweets.find({creator: Meteor.userId(), polarity: 'neutral'}).count(),
		neg = Tweets.find({creator: Meteor.userId(), polarity: 'negative'}).count();
	var sum = Math.min(pos, pos_total) + Math.min(neu, neu_total) + Math.min(neg, neg_total);
	return {
		'todo': total,
		'pos_progress': pos + ' of ' + pos_total,
		'neu_progress': neu + ' of ' + neu_total,
		'neg_progress': neg + ' of ' + neg_total,
		'sum_progress': sum + ' of ' + total,
		'barpos': Math.floor(100.0 * pos / pos_total),
		'barneu': Math.floor(100.0 * neu / neu_total),
		'barneg': Math.floor(100.0 * neg / neg_total)
	}
}

var selectedTab = function(option) {
	if(option === undefined) 
		return Session.get('selectedTab');
	return option == Session.get('selectedTab') ? 'active' : '';
}

Template.collaborate.rendered = function() {
	$('a[data-toggle=tab]').click(function(e) {
		Session.set('selectedTab', $(this).attr('href').slice(1));
	});
}

Template.collaborate.isRecent = function() {
	return selectedTab('recentTweets');
}

Template.collaborate.isUnchecked = function() {
	return selectedTab('uncheckedTweets');
}

Template.collaborate.isChecked = function() {
	return selectedTab('checkedTweets');
}

Template.collaborate.isAdded = function() {
	return selectedTab('addedTweets');
}

Template.collaborate.events({
	'click #export': function(e) {
		window.saveAs(new Blob([getTweetsJSONString()], {type: 'application/json'}), 'tweets.json');
	}
});

Template.collaborate.json = function() {
	return encodeURIComponent(getTweetsJSONString());
}

Template.recentTweetsTable.entries = function() {
	var cursor = Tweets.find({}, {sort: {created: -1}, limit: 10});
	return cursor.fetch()
}

Pagination.prototype._bootstrap = function() {
	var html = "";
	if(!this._currentCount || this._totalPages < 2){
		return html = "";
	}
	var data ='data-head="'+this._head+'" onclick="Pagination.goto(this)"';
	html += '<div>' ;
	html += '<ul class="pagination pagination-sm">';
	html += '<li><a href="#Tweets"'+data+' data-page="1">«</a></li>';
	for (var i = 1;i < this._totalPages + 1; i++) {
	if(i !== this._currentPage){
		html += '<li><a href="#Tweets" '+data+'data-page="'+i+'">'+i+'</a></li>'
	}else{
		html += '<li class="active"><a href="#Tweets" '+data+'data-page="'+i+'">'+i+'</a></li>'
	}
	}
	html += '<li><a href="#Tweets" '+data+'data-page="'+this._totalPages+'">»</a></li>';
	html += '</ul>';
	html += '</div>'
	return html;
}

Pagination.prototype.sortedSkip = function() {
	return $.extend(this.skip(), {sort: {created: -1}});
}

var uncheckedPage = new Pagination("uncheckedTweets");

Template.uncheckedTweetsTable.entries = function() {
	var cursor = Tweets.find({
		$and: [
			{ creator: { $ne: Meteor.userId()}},
			{ feedback: { $not: { $elemMatch: { user: Meteor.userId() } }}}
		]
	}, uncheckedPage.sortedSkip());
	return cursor;
}

Template.uncheckedTweetsTable.pager = function() { 
	var count = Tweets.find({
		$and: [
			{ creator: { $ne: Meteor.userId()}},
			{ feedback: { $not: { $elemMatch: { user: Meteor.userId() } }}}
		]
	}).count();
	return uncheckedPage.create(count);
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

var checkedPage = new Pagination("checkedTweets");

Template.checkedTweetsTable.entries = function() {
	var cursor = Tweets.find({
		$and: [
			{ creator: { $ne: Meteor.userId()}},
			{ feedback: { $elemMatch: { user: Meteor.userId() } }}
		]
	}, checkedPage.sortedSkip());
	return cursor;
}

Template.checkedTweetsTable.pager = function() { 
	var count = Tweets.find({
		$and: [
			{ creator: { $ne: Meteor.userId()}},
			{ feedback: { $elemMatch: { user: Meteor.userId() } }}
		]
	}).count();
	return checkedPage.create(count);
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

var addedPage = new Pagination("addedTweets");

Template.addedTweetsTable.entries = function() {
	var cursor = Tweets.find({ creator: Meteor.userId()}, addedPage.sortedSkip() );
	return cursor;
}

Template.addedTweetsTable.pager = function() {
	var count = Tweets.find({ creator: Meteor.userId()}).count();
	return addedPage.create(count);	
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

Template.tweetEntry.rendered = function() {
	$('.infoTweet').popover({
		placement: 'bottom',
		trigger: 'hover',
	});	
}

Template.tweetEntry.owner = function() {
	return this.creator === Meteor.userId();
}

Template.tweetEntry.feedback = function() {
	var sum = this.feedback.length,
		pos = _.filter(this.feedback, function(el) {
			return el.isCorrect;
		}).length,
		neg = sum - pos,
		cssClass;
	cssClass = (pos == neg) ? 'default' : ((pos > neg) ? 'success' : 'warning') 
	return {
		pos: pos,
		neg: neg,
		sum: sum,
		cssClass: cssClass 
	}
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

getTweetsJSONString = function() {
	var tweets = _.map(Tweets.find().fetch(), function(tweet) {
		delete tweet['_id']
		var sum = tweet.feedback.length,
			pos = _.filter(tweet.feedback, function(el) {
				return el.isCorrect;
			}).length,
			neg = sum - pos;
		delete tweet['feedback'];
		$.extend(tweet, { confirm: pos, denied: neg});
		return tweet;
	});
	return JSON.stringify(tweets, null, '\t');
}