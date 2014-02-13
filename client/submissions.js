Meteor.subscribe('mySubmissions');

Template.submissions.isReady = function() {
	return Session.get('jobDone');
}

Template.newSubmission.canAdd = function() {
	return Session.get('weekUploads') < 10;
}

Template.newSubmission.uploadCount = function() {
	return Session.get('weekUploads');
}

Template.newSubmission.events({
	'change .fileUploader': function (e) {
		var files = e.target.files;
		var result = confirm("Do you really want to upload " + files[0].name + "?");
		if (result === true) {
			try {
				SubmissionsFS.storeFile(files[0]);
			} catch(e) {
				displayAlert("File can not be uploaded", 'danger', 2000);
				console.log(e);
			}
		}
		Meteor.call('weekUploads', function(err, result) {
			Session.set('weekUploads', err ? 0 : result);
		});
    }
});

Template.oldSubmissions.entries = function() {
	return SubmissionsFS.find();
}

Template.submissionResult.date = function() {
	return new Date(this.uploadDate).toString();
}

Template.submissionResult.result = function() {
	return Session.get('upl' + this._id);
}