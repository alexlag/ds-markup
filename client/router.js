Router.configure({
	layoutTemplate: 'layout'
});

Router.map(function () {

	this.route('twitter', {
		path: '/twitter',
		before: function() {
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
			document.title = 'Sentanal Submissions';
		},
		waitOn: function() {
			Meteor.call('jobDone', function(err, result) {
				Session.set('jobDone', err ? false : result);
			});
			Meteor.call('weekUploads', function(err, result) {
				Session.set('weekUploads', err ? 0 : result);
			});
		},
		data: {
			submissionClass: 'active'
		},
		template: 'submissions'
	});

	this.route('home', {
		path: '/',
		before: function() {
			Router.go('twitter')
		}
	});
});