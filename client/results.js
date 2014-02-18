Template.resultsTable.entries = function() {
	return Session.get('resultsArr');
}

Template.resultsTable.rendered = function() {
	$("#resultsTable").tablesorter({ 
		sortList: [[1,0]] 
	}); 
}