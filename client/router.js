Router.configure({
	layoutTemplate: 'layout'
});

Router.map(function () {

	this.route('twitter', {
		path: '/twitter',
		before: function() {
			var	tab = this.params.tab || Session.get('tweetsTable').tab;
			var	page = parseInt(this.params.page, 10) || Session.get('tweetsTable').page;
			if(Meteor.userId()) {
				var handle = Meteor.subscribe(tab + 'Tweets', 10, 10*(page-1));
				if(handle.ready()) {
					NProgress.done();
				} else {
					NProgress.start();
					this.stop();
				}
				Meteor.call('jobDone', function(err, result) {
					Session.set('jobDone', err ? false : result);
				});
				Session.set('tweetsTable', {
					tab: tab,
					page: page
				});
			}
			document.title = 'Twitter Markup';
		},
		data: {
			twitterClass: 'active'
		},
		template: 'twitter'
	});

	this.route('submissions', {
		path: '/submissions',
		before: function() {
			if(Meteor.userId()) {
				var handle = Meteor.subscribe('mySubmissions');
				if(handle.ready()) {
					NProgress.done();
				} else {
					NProgress.start();
					this.stop();
				}
				Meteor.subscribe('myDeadlines');
				Meteor.call('jobDone', function(err, result) {
					Session.set('jobDone', err ? false : result);
				});
				Meteor.call('weekUploads', function(err, result) {
					Session.set('weekUploads', err ? 0 : result);
				});
				SubmissionsFS.find().forEach(function(sub){
					Meteor.call('subResult', sub._id, function(err, res) {
						Session.set('upl' + sub._id, err ? 'No data' : res);
					});
				});
			}
			document.title = 'Sentanal Submissions';
		},
		data: {
			submissionClass: 'active'
		},
		template: 'submissions'
	});

	this.route('results', {
		path: '/results',
		before: function() {
			if(Meteor.userId()) {
				Meteor.call('getResults', function(err, result) {
					Session.set('resultsArr', err ? null : result);
				})
			}
			document.title = 'Results';
		},
		data: {
			resultsClass: 'active'
		},
		template: 'results'
	});

	this.route('home', {
		path: '/',
		action: function() {
			this.redirect('/twitter')
		}
	});
});