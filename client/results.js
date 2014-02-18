Template.resultsTable.entries = function() {
	var result = Session.get('resultsArr');
	if(result && result.length !== 0)
		return result;
	else
		return [{
			name: '',
			cssClass: '',
			w: '',
			d1: '',
			d2: '',
			d3: '',
			score: ''
		}];
}

Template.resultsTable.rendered = function() {
	$("#resultsTable").tablesorter({ 
		sortList: [[1,0]] 
	}); 
}