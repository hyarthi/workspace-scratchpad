
/*
 * GET home page.
 */

exports.canvas = function(req, res){
  res.render('canvas.html', { title: 'Watson Workspace ScratchPad' });
};