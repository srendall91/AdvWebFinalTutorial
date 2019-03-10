// Load the page

exports.serveIndex = function(app, staticFolder){
	app.get('*', function(req,res){
		res.sendfile('index.html', {root:staticFolder});
	});
};
