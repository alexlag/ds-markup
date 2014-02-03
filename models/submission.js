SubmissionsFS = new CollectionFS('submissions');

SubmissionsFS.filter({
	maxSize: 1048576
});

SubmissionsFS.allow({
	insert: function(userId, file) { 
		return false;
	},
	update: function(userId, file, fields, modifier) {
		return false;
	},
	remove: function(userId, file) { 
		return false; 
	}
});