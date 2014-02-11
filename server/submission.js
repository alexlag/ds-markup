Meteor.publish('mySubmissions', function() {
	if (this.userId) {
		return SubmissionsFS.find({ owner: this.userId });
	}
});

SubmissionsFS.fileHandlers({
	"sendToJail": function (options) {
		console.log(options);
		return '/'+Math.random();
	}
});

weekUploadsUser = function(userId) {
	var uploads = SubmissionsFS.find({owner: userId}).fetch();
	var lineDate = new Date();
	lineDate.setHours(0); lineDate.setMinutes(0); lineDate.setSeconds(0); lineDate.setMilliseconds(0);  
	while(lineDate.getDay() != 4) {
		lineDate.setDate(lineDate.getDate() - 1); 
	}
	console.log(lineDate.toString());
	var uploadsThisWeek = _.filter(uploads, function(el) {
		var day = new Date(el.uploadDate);
		console.log(day.toString());
		return day >= lineDate;
	});
	return uploadsThisWeek.length;
}