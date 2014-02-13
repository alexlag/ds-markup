Meteor.publish('mySubmissions', function() {
	if (this.userId) {
		return SubmissionsFS.find({ owner: this.userId });
	}
});

var jailServer = "http://172.31.189.134:3000/";

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
	var lineDate = getLineDate();
	tweets = _.filter(tweets, function(tweet) {
		return (tweet.created <= lineDate) || (tweet.creator === Meteor.userId());
	});
	return JSON.stringify(tweets);
}

Meteor.methods({
	"uploadFiles": function(options) {
		var owner = options.fileRecord.owner;
		var email = Meteor.users.findOne({_id: owner}).emails[0].address;
		try {
			var result = HTTP.call("POST", jailServer + "submit.json", {
				data: {
					submission: {
						mongoId: options.fileRecord._id,
						email: email,
						upload: {
							filename: options.fileRecord.filename,
							data: options.blob
						},
						train: {
							filename: 'tweets.json',
							data: getTweetsJSONString(owner)
						}
					}
				},
				timeout: 10000
			});
			return jailServer + 'status/' + options.fileRecord._id + '.json';
		} catch(e) {
			return null;
		}
	},
	"subResult": function(fileId) {
		var result = HTTP.call("GET", jailServer + "status/" + fileId + '.json');
		return result.statusCode != 200 ? 'Error ' + result.content : result.data.result;
	},
	"getLineDate": function() {
		return getLineDate();
	}
})

SubmissionsFS.fileHandlers({
	"sendToJail": function (options) {
		return Meteor.call("uploadFiles", options);	
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