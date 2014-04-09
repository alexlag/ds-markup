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

var floatExtraction = function(node) {
	var parsed = parseFloat(node.innerHTML);
	return isNaN(parsed) ? '0' : node.innerHTML;
}

Template.resultsTable.rendered = function() {
	$("#resultsTable").tablesorter({ 
		textExtraction: floatExtraction,
		sortList: [[1,1]] 
	}); 
}