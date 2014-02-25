Meteor.subscribe('broadcast');

Meteor.startup(function() {
	updateStatistics();
	Broadcast.find().observe({
		changed: updateStatistics
	});
	Session.setDefault('tweetsTable', {tab: 'recent', page: 1});
	Session.setDefault('jobDone', false);
	Session.setDefault('badges', {unchecked: 0, checked: 0, added: 0});

	Accounts.ui._options = {
	    requestPermissions: {},
	    extraSignupFields: [
	        {
	            fieldName: 'fullname',
	            fieldLabel: 'Full name',
	            validate: function(value, errorFn) {
	                if(!value) {
	                    errorFn('Please provide full name');
	                    return false;
	                }
	                value = value.trim();
	                if(!value.match(/\s/) || value.length < 5) {
	                	errorFn('Thats probably not a full name');
	                    return false;
	                }
	                return true;
	            },
	            visible: function() {
	                return true;
	            }
	        },
	        {
	            fieldName: 'number',
	            fieldLabel: 'Student Number',
	            validate: function(value, errorFn) {
	                if(!value || !value.match(/\d{8}/)) {
	                    errorFn('Please provide legit student number');
	                    return false;
	                }
	                return true;
	            },
	            visible: function() {
	                return true;
	            }
	        }
	    ]
	};
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

var updateStatistics = function() {
	updateBadges();
	Meteor.call('getUserStatistics', function(err, res) {
		if(!err)
			Session.set('statisticTotal', res);
	});
	Meteor.call('jobDone', function(err, result) {
		if(!err)
			Session.set('jobDone', result);
	});
}

var updateBadges = function() {
	Meteor.call('getUserBadges', function(err, res) {
		if(!err)
			Session.set('badges', res);
	});
}

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
		text: $(inputSelector).val(),
		polarity: polarity
	});
	var res = Session.get('alert');
	displayAlert(res.message, res.alert, 2000);
	if(res.alert === 'success') {
		$(inputSelector).val('');
	}
	return false;
}

Template.adding.events({
	'click #addPositive': function(e) {
		parseAndAddTweet('positive');
		e.preventDefault();
	},
	'keypress #inputPositive': function(e) {
		if(e.keyCode === 13) {
			parseAndAddTweet('positive');
			e.preventDefault();
		}
	},
	'click #addNeutral': function(e) {
		parseAndAddTweet('neutral');
		e.preventDefault();
	},
	'keypress #inputNeutral': function(e) {
		if(e.keyCode === 13) {
			parseAndAddTweet('neutral');
			e.preventDefault();
		}
	},
	'click #addNegative': function(e) {
		parseAndAddTweet('negative');
		e.preventDefault();
	},
	'keypress #inputNegative': function(e) {
		if(e.keyCode === 13) {
			parseAndAddTweet('negative');
			e.preventDefault();
		}
	}
})

Template.statistic.total = function() {
	var response = Session.get('statisticTotal');
	if(!response) return null;
	var pos_total = response.pos_total, neu_total = response.neu_total, neg_total = response.neg_total,
		total = pos_total + neu_total + neg_total,
		pos = response.pos,
		neu = response.neu,
		neg = response.neg;
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
}

Template.collaborate.events({
	'click #export': function(e) {
		Meteor.call("jsonExport", function(err, res) {
			if(err) {
				console.log('Export file was not recieved: ', err);
			} else {
				window.saveAs(new Blob([res], {type: 'application/json'}), 'tweets.json');
			}	
		})
	},
	'click #recentTab': function(e) {
		Session.set('tweetsTable', {tab: 'recent', page: 1});
		e.preventDefault()
	},
	'click #uncheckedTab': function(e) {
		Session.set('tweetsTable', {tab: 'unchecked', page: 1});
		e.preventDefault()
	},
	'click #checkedTab': function(e) {
		Session.set('tweetsTable', {tab: 'checked', page: 1});
		e.preventDefault()
	},
	'click #addedTab': function(e) {
		Session.set('tweetsTable', {tab: 'added', page: 1});
		e.preventDefault()
	}
});

Template.collaborate.exportButton = function() {
	return Session.get('jobDone') ? '<a id="export" class="btn btn-sm btn-default">Export</a>' : '';
}

Template.collaborate.tab = function(name) {
	return Session.get('tweetsTable').tab === name ? 'active' : '';
}

Template.collaborate.uncheckedCount = function() {
	return Session.get('badges').unchecked;
}

Template.collaborate.checkedCount = function() {
	return Session.get('badges').checked;
}

Template.collaborate.addedCount = function() {
	return Session.get('badges').added;
}

Template.tweetsTable.entries = function() {
	var sort = Session.get('tweetsTable').tab === 'unchecked' ? 1 : -1;
	return Tweets.find({}, {sort: {created: sort}});
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
		var result = confirm('Are you sure?');
		if(result === true) {
			Meteor.call('removeTweet', this._id);
		}
		e.preventDefault();
	},
});

Template.tweetEntry.polarityClass = function() {
	switch(this.polarity) {
		case 'neutral': return 'active';
		case 'positive': return 'success';
		case 'negative': return 'danger';
	}
	return '';
}

Template.tweetEntry.rendered = function() {
	$('.infoTweet').popover({
		placement: 'bottom',
		trigger: 'hover'
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
	cssClass = (pos === neg) ? 'default' : ((pos > neg) ? 'success' : 'warning')
	return {
		pos: pos,
		neg : neg,
		sum: sum,
		cssClass: cssClass
	}
}

Template.tweetEntry.feedbackCorrect = function() {
	return feedbackButtonState(this.feedback) === 1 ? 'success' : 'default';
}

Template.tweetEntry.feedbackIncorrect = function() {
	return feedbackButtonState(this.feedback) === -1 ? 'danger' : 'default';
}

var feedbackButtonState = function(feedback) {
	var userId = Meteor.userId();
	var filtered = feedback.filter(function(el) {
		return el.user === userId;
	});
	if(filtered.length === 0) {
		return 0;
	} else {
		return filtered[0].isCorrect ? 1 : -1;
	}
}

Template.pager.data = function() {
	var tab = Session.get('tweetsTable').tab,
		page = Session.get('tweetsTable').page,
	 	totalPages = Math.floor(Session.get('badges')[tab] / 10) + 1; 

	if(!totalPages || totalPages < 2) return null;
	return {
		tab: tab,
		page: page,
		totalPages: totalPages,
		previousPage: Math.max(1, page - 1),
		nextPage: Math.min(totalPages, page + 1)
	};
	var html = "";
	if(totalPages < 2){
		return html = "";
	}
}

Template.pager.events({
	'click #pagerFirst': function(e){
		Session.set('tweetsTable', {tab: this.tab, page: 1});
		e.preventDefault();
	},
	'click #pagerPrevious': function(e){
		Session.set('tweetsTable', {tab: this.tab, page: this.previousPage});
		e.preventDefault();
	},
	'click #pagerLast': function(e){
		Session.set('tweetsTable', {tab: this.tab, page: this.totalPages});
		e.preventDefault();
	},
	'click #pagerNext': function(e){
		Session.set('tweetsTable', {tab: this.tab, page: this.nextPage});
		e.preventDefault();
	},
	'keypress input#pager': function(e) {
		if(e.keyCode === 13) {
			var targetPage = parseInt($('input#pager').val(),10);
			if(targetPage && targetPage > 0 && targetPage <= this.totalPages) 
				Session.set('tweetsTable', {tab: this.tab, page: targetPage});
			e.preventDefault();
		}
	}
})
