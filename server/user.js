Accounts.validateNewUser(function (user) {
	var profiles = _.pluck(Meteor.users.find().fetch() || [], 'profile');
	var numbers = _.pluck(profiles, 'number');
	if(_.contains(numbers, user.profile.number))
		throw new Meteor.Error(403, "Student number was already registered");

	var fullnames = _.pluck(profiles, 'fullname');
	if(_.contains(fullnames, user.profile.fullname))
		throw new Meteor.Error(403, "Full name was already registered");

	return true;
});