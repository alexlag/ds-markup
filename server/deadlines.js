Meteor.publish("myDeadlines", function () {
	if(this.userId)
		return Deadlines.find({student: this.userId}, {});
});