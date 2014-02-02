Router.configure({
	layoutTemplate: 'layout'
});

Router.map(function () {
	this.route('twitter', {
		path: '/twitter',
		before: function() {
			document.title = 'Twitter Markup';
		},
		template: 'twitter'
	});

	this.route('home', {
		path: '/',
		action: Router.go('twitter')
	});
});