
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index.html', { title: 'Cloudant Boiler Plate' });
};

exports.canvas = function(req, res){
  res.render('canvas.html', { title: 'Watson Workspace ScratchPad' });
};