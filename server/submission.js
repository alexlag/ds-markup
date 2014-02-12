Meteor.publish('mySubmissions', function() {
	if (this.userId) {
		return SubmissionsFS.find({ owner: this.userId });
	}
});

var jailServer = "http://172.31.189.134:3000/submissions";

var getTweetsJSONString = function(userId) {
	var tweets = _.map(Tweets.find().fetch(), function(tweet) {
		delete tweet['_id']
		var sum = tweet.feedback.length,
			pos = _.filter(tweet.feedback, function(el) {
				return el.isCorrect;
			}).length,
			neg = sum - pos;
		delete tweet['feedback'];
		_.extend(tweet, { confirm: pos, denied: neg});
		tweet.created = new Date(tweet.created);
		return tweet;
	});
	return JSON.stringify(tweets, null, '\t');
}

Meteor.methods({
	"uploadToJail": function(options) {
			var owner = options.fileRecord.owner;
			var email = Meteor.users.findOne({_id: owner}).emails[0].address;
			var result = HTTP.call("POST", jailServer, {
				data: {
					submission: {
						mongoId: options.fileRecord._id,
						email: email,
						upload: options.blob,
						train: getTweetsJSONString(owner)
					}
				},
				timeout: 10000
			});
			return jailServer + '/' + options.fileRecord._id;
	}
})

SubmissionsFS.fileHandlers({
	"sendToJail": function (options) {
			return Meteor.call('uploadToJail', options);
	}
});

var getLineDate = function() {
	var lineDate = new Date();
	lineDate.setHours(0); lineDate.setMinutes(0); lineDate.setSeconds(0); lineDate.setMilliseconds(0);  
	while(lineDate.getDay() != 3) {
		lineDate.setDate(lineDate.getDate() - 1); 
	}
	return lineDate;
}

weekUploadsUser = function(userId) {
	var uploads = SubmissionsFS.find({owner: userId}).fetch();
	var lineDate = getLineDate();
	var uploadsThisWeek = _.filter(uploads, function(el) {
		var day = new Date(el.uploadDate);
		return day >= lineDate;
	});
	return uploadsThisWeek.length;
}