SubmissionsFS = new CollectionFS('submissions');

SubmissionsFS.filter({
	maxSize: 1048576
});

SubmissionsFS.allow({
	insert: function(userId, file) { 
		return userId && file.owner === userId && weekUploadsUser(userId) < 10;
	},
	update: function(userId, file, fields, modifier) {
		return false;
	},
	remove: function(userId, file) { 
		return false; 
	}
});

Meteor.methods({
	weekUploads: function() {
		if(Meteor.isServer && Meteor.user) {
			return weekUploadsUser(Meteor.userId);
		}
	}
})