Template.resultsTable.entries = function() {
	var result = Session.get('resultsArr') || [{
		name: '',
		cssClass: '',
		w: '',
		d1: '',
		d2: '',
		d3: '',
		score: ''
	}];
	return result;
}

Template.resultsTable.rendered = function() {
	$("#resultsTable").tablesorter({ 
		sortList: [[1,0]] 
	}); 
}