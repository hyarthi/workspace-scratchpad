function ScratchPad() {
	console.log('Initializing scratchpad object');
	this.canvas = {
		id: "wwScratchpadCanvas",
		node: {},
	};
	console.log('spawning canvas markup');
	// record node
	console.log("> #" + this.canvas.id);
	this.canvas.node = $("[id='wwScratchpadCanvas']");//$('div#' + this.canvas.id);
	console.log('spreading canvas');
	this.canvas.node.css({
		'width' : '100%',
		'height' : '100%'
		});
	console.log('loader image');
	console.log(this.canvas.node.length + "       " + new Date());
	// fill with loader image
	this.canvas.node.append('<img id="ww_sp_loading_img" src="/images/loading.gif"></img>');
	this.canvas.placeholder = {
		id: "ww_sp_loading_img"
	};
	this.canvas.placeholder.node = $('#' + this.canvas.placeholder.id);
	this.canvas.placeholder.node.css({
		'float': 'center',
			'vertical-align': 'middle'
	});
	console.log('diagram draw');
	// init diagram canvas
	this.canvas.node.append('<div id="ww_sp_diagram"></div>');
	this.canvas.diagram = {
		id: 'ww_sp_diagram'
	};
	this.canvas.diagram.node = $('#' + this.canvas.diagram.id);
	this.canvas.diagram.node.css({
		'width': '100%',
		'height': '100%',
		'display': 'none'
	});
	console.log("getting space id");
	var addr = window.location.href;
	addr = addr.substring(addr.lastIndexOf("/") + 1, addr.length);
	console.log('id - ' + addr);
	this.space_id = addr;
	console.log('done initializing');
}

ScratchPad.prototype.initialize = function() {
	console.log('drawing menu screen');
	var diagram = this.canvas.diagram;
	var placeholder = this.canvas.placeholder;
	console.log('authenticating');
	// STUB try to log in
	$.get("//lotuslocal:3000/api/space/" + scratchpad.space_id + "/init", function(data, status, xhr) {
		console.log(data);
		console.log(xhr);
		console.log(status);
		console.log(xhr.status);
		if (xhr.status === 200) {
			// success
			diagram.node.append('<h1>SUCCESS</h1><br><span>Result: ' + JSON.stringify(data) + '</span>');
			diagram.node.css({'display': 'block'});
			placeholder.node.css({'display': 'none'});
		} else {
			// failure
			diagram.node.append('<h1>FAILURE</h1><br><span>Result: ' + JSON.stringify(data) + '</span>');
			diagram.node.css({'display': 'block'});
			placeholder.node.css({'display': 'none'});
		}
	});
	console.log('done');
};

var scratchpad;
$(document).ready(function() {
	scratchpad = new ScratchPad();
	scratchpad.initialize();
});
//scratchpad.startMenu();
