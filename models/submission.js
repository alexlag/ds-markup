CollectionFS.prototype.fileIsAllowed = function(fileRecord) {
            var self = this;
            if (!self._filter) {
                return true;
            }
            if (!fileRecord || fileRecord.contentType === null || !fileRecord.filename) {
                throw new Error("invalid fileRecord:", fileRecord);
            }
            var fileSize = fileRecord.size || parseInt(fileRecord.length, 10);
            if (!fileSize || isNaN(fileSize)) {
                throw new Error("invalid fileRecord file size:", fileRecord);
            }
            var filter = self._filter;
            if (filter.maxSize && fileSize > filter.maxSize) {
                self.dispatch('invalid', CFSErrorType.maxFileSizeExceeded, fileRecord);
                return false;
            }
            var saveAllFileExtensions = (filter.allow.extensions.length === 0);
            var saveAllContentTypes = (filter.allow.contentTypes.length === 0);
            var ext = getFileExtension(fileRecord.filename);
            var contentType = fileRecord.contentType;
            if (!((saveAllFileExtensions || _.indexOf(filter.allow.extensions, ext) !== -1) &&
                    _.indexOf(filter.deny.extensions, ext) === -1)) {
                self.dispatch('invalid', CFSErrorType.disallowedExtension, fileRecord);
                return false;
            }
            if (!((saveAllContentTypes || contentTypeInList(filter.allow.contentTypes, contentType)) &&
                    !contentTypeInList(filter.deny.contentTypes, contentType))) {
                self.dispatch('invalid', CFSErrorType.disallowedContentType, fileRecord);
                return false;
            }
            return true;
        }

SubmissionsFS = new CollectionFS('submissions', { autopublish: false });

SubmissionsFS.filter({
	allow: {
        extensions: ['zip']
    },
	maxSize: 15728640
});

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