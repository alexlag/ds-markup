Deadlines = new Meteor.Collection('deadlines');

Deadlines.allow({
	insert: false,
	update: false,
	delte: false
})