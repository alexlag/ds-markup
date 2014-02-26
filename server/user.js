Accounts.validateNewUser(function(user) {
	var profiles = _.pluck(Meteor.users.find().fetch() || [], 'profile');
	if(profiles && profiles.length > 0) {
		var numbers = _.map(profiles, function(el) {
			if(el && el.number)
				return el.number;
			else
				return '' 
		});
		if(_.contains(numbers, user.profile.number))
			throw new Meteor.Error(403, "Student number was already registered");

		var fullnames = _.map(profiles, function(el) {
			if(el && el.fullname)
				return el.fullname;
			else
				return '' 
		});
		if(_.contains(fullnames, user.profile.fullname))
			throw new Meteor.Error(403, "Full name was already registered");
	}

	return true;
});

Accounts.onCreateUser(function(options, user) {
	if(options.profile) {
		user.profile = options.profile;
		user.profile.privileged = false;
		user.profile.isStudent = true;
		user.profile.maxWeeklyUploads = 10;
		user.profile.score = 0; 
	}
	return user;
});

Accounts.emailTemplates.from = 'Markup <no-reply@ispras.ru>';