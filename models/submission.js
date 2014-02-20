SubmissionsFS = new CollectionFS('submissions', { autopublish: false });

SubmissionsFS.filter({
	allow: {
        extensions: ['zip']
    },
	maxSize: 15728640
});

if(Meteor.isClient) {
	SubmissionsFS.acceptDropsOn("newSubmission", ".col-md-6");
}

SubmissionsFS.events({
	'invalid': function(type, fileRecord) {
		if(Meteor.isClient) {
			if (type === CFSErrorType.disallowedContentType || type === CFSErrorType.disallowedExtension) {
				displayAlert('File is not a zip-archive', 'danger', 2000);
			} else if (type === CFSErrorType.maxFileSizeExceeded) {
				displayAlert("File is too big to upload.", 'danger',2000);
			}
		}
	},
	'ready': function() {
		console.log('ready');
	},
	'start': function() {
		console.log('start');
	}
});

SubmissionsFS.allow({
	insert: function(userId, file) { 
		return userId && (file.owner === userId) && (weekUploadsUser(userId) < 10);
	},
	update: function(userId, file, fields, modifier) {
		return false;
	},
	remove: function(userId, file) { 
		return false; 
	}
});

Meteor.methods({
	'weekUploads': function() {
		if(Meteor.isServer && Meteor.user) {
			return weekUploadsUser(Meteor.userId());
		}
	}
})