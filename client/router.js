Router.configure({
	layoutTemplate: 'layout'
});

Router.map(function () {

	this.route('twitter', {
		path: '/twitter',
		before: function() {
			var handle = Meteor.subscribe('tweets');
			if(!handle || handle.ready()) {
				NProgress.done();
			} else {
				NProgress.start();
				this.stop();
			}
			document.title = 'Twitter Markup';
			Meteor.call('jobDone', function(err, result) {
				Session.set('jobDone', err ? false : result);
			});
		},
		data: {
			twitterClass: 'active'
		},
		template: 'twitter'
	});

	this.route('submissions', {
		path: '/submissions',
		before: function() {
			var handle = Meteor.subscribe('mySubmissions');
			if(!handle || handle.ready()) {
				NProgress.done();
			} else {
				NProgress.start();
				this.stop();
			}
			Meteor.subscribe('myDeadlines');
			document.title = 'Sentanal Submissions';
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
		},
		data: {
			submissionClass: 'active'
		},
		template: 'submissions'
	});

	this.route('results', {
		path: '/results',
		before: function() {
			Meteor.call('getResults', function(err, result) {
				Session.set('resultsArr', err ? null : result);
			})
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