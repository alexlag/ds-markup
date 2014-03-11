var weekly = function() {
	var today = new Date();
	if(today.getDate() === 12 && today.getMonth() === 2) return 0;
	if(today.getDate() === 9 && today.getMonth() === 3) return 0;
	if(today.getDate() === 7 && today.getMonth() === 4) return 0;
	massUpload('w');
}

var deadline1 = function() {
	console.log('I WAS IN DEADLINE 1')
	massUpload('d1');
}

var deadline2 = function() {
	massUpload('d2');
}

var deadline3 = function() {
	massUpload('d3');
}

var cron = new Meteor.Cron( {
	events:{
		"0 0 * * 3"  : weekly,
		"39 0 12 3 *" : deadline1,
		"44 0 12 2 *" : deadline1,
		"0 0 9 4 *" : deadline2,
		"0 0 7 5 *" : deadline3
	}
});

var jailServer = "http://172.31.189.134:3000/";

var getDeadlineResult = function(deadline) {
	if(!deadline || !deadline.url) return 'None';
	var result = HTTP.call("GET", deadline.url, {timeout: 100});
	return result.statusCode !== 200 ? 'Error ' + result.content : result.data.result;
}

Meteor.methods({
	"getResults": function() {
		var resultsTable = [];
		Meteor.users.find().forEach(function(user) {
			if(user.deadlines) {
				cssClass = '';
				if(user._id === Meteor.userId()) cssClass = 'success';
				if(user.profile.fullname === 'Baseline 1' || user.profile.fullname === 'Baseline 2') cssClass = 'warning';
				var weekResult = getDeadlineResult(user.deadlines.w);
				weekResult = (weekResult === 'None') ? 0 : weekResult;
				resultsTable.push({
					name: user.profile.fullname,
					cssClass: cssClass,
					w: weekResult,
					d1: getDeadlineResult(user.deadlines.d1),
					d2: getDeadlineResult(user.deadlines.d2),
					d3: getDeadlineResult(user.deadlines.d3),
					score: user.profile.score || 0
				})
			}
		});
		return resultsTable;
	}
});

var massUpload = function(name) {
	var tweets = getTweetsJSONString();

	Meteor.users.find().forEach(function(user) {
		var submission = SubmissionsFS.findOne({owner: user._id},{sort: {uploadDate: -1}});
		if(user.profile && user.profile.isStudent && submission) {
			var blob = SubmissionsFS.retrieveBuffer(submission._id),
				id = name + Random.id(),
				email = user.emails[0].address,
				result = getURL(id, email, blob, tweets);

			var modifier = {$set: {}};
			modifier.$set['deadlines.w'] = {
						fileId: submission._id,
						url: result
					};	
			Meteor.users.update({_id: user._id}, modifier);
			if(name !== 'w') {
				var modifier = {$set: {}};
				modifier.$set['deadlines.' + name] = {
							fileId: submission._id,
							url: result
						};	
				Meteor.users.update({_id: user._id}, modifier);
			}
		}
	});
}

var getURL = function(id, email, blob, tweets) {
	try {
		result = HTTP.call("POST", jailServer + "submit.json", {
			data: {
				submission: {
					mongoId: id,
					email: email,
					upload: {
						filename: 'archive.zip',
						data: blob
					},
					train: {
						filename: 'tweets.json',
						data: tweets
					}
				}
			},
			timeout: 10000
		});
		result = jailServer + 'status/' + id + '.json';
	} catch(e) {
		result = '';
	}
	return result;
}

var getTweetsJSONString = function() {
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
	return JSON.stringify(tweets);
}