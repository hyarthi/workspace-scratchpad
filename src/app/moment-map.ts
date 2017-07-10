import { Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { DiagramDrawer } from './diagram-drawer.interface';
import { APIService, AnnotationType } from './api.service';
import { Annotation } from './annotation'
import { D3ForceNode } from './d3-force-node';
import { D3ForceLink } from './d3-force-link';


declare var d3: any;

export class MomentMap implements DiagramDrawer {
	momentNodes: D3ForceNode[];
	canvasId: string;
	width: number;
	height: number;
	//zoomThreshold: number;
	force: any;
	svg: any;
	api: APIService;
	spaceId: string;
	graph: any;
	graphNodes: any;
	zoom: any;
	activeNode: any;
	graphChildNodes: any;
	graphChildLinks: any;
	cforce: any;
	scale: number;

	constructor(cId: string, cH: number, cW: number, spcId: string) {
		this.canvasId = cId;
		this.height = cH;
		this.width = cW;
		this.spaceId = spcId;
	}

	init(apiref: APIService) : void {
		this.api = apiref;
		this.scale = 1;
		// init force layout
		this.force = d3.forceSimulation()
					.force('charge', d3.forceManyBody())
					.force('center', d3.forceCenter(this.width / 2, this.height / 2))
					.force('collide', d3.forceCollide((d) => { return d.radius + 10; }).iterations(16))
					.force('x', d3.forceX(0))
					.force('y', d3.forceY(0));
		this.svg = d3.select(this.canvasId).append("svg")
					.attr('xmlns','http://www.w3.org/2000/svg')
					.attr("width", this.width)
					.attr("height", this.height)
					.attr("id","graph")
					//.attr("viewBox", "0 0 " + this.width + " " + this.height )
					//.attr("preserveAspectRatio", "xMidYMid meet");
		// init top-level moments
		this.momentNodes = [];
		this.loadMoments().then(() => {
			this.drawDiagram();
		});
	}

	loadMoments() : Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.api.getAnnotations(this.spaceId, AnnotationType.MOMENT, 0, 25).subscribe(annos => {
				console.log("annos: " + annos.length);
				for (let i = 0; i < annos.length; i++) {
					// get moment's weight
					let weight = 0;
					if (annos[i].fields["participants"])
						for (let j = 0; j < annos[i].fields["participants"].length; j++) {
							weight += annos[i].fields["participants"][j].messageCount;
						}
					// get moment's labels
					let text = '';
					if (annos[i].fields["momentSummary"] && annos[i].fields["momentSummary"]["phrases"])
						for (let j = 0; j < annos[i].fields["momentSummary"]["phrases"].length; j++) {
							text += (j === 0 ? '' : ', ') + annos[i].fields["momentSummary"]["phrases"][j].label;
						}
					this.momentNodes[i] = new D3ForceNode(annos[i].id, "mm0_", this.momentNodes.length, (100 + (10 * (weight - 5))), text);
					// get moment's start & end message dates
					if (annos[i].fields["startMessage"] && annos[i].fields["startMessage"]["published"])
						this.momentNodes[i].fields["startDate"] = annos[i].fields["startMessage"]["published"];
					if (annos[i].fields["endMessage"] && annos[i].fields["endMessage"]["published"])
						this.momentNodes[i].fields["endDate"] = annos[i].fields["endMessage"]["published"];
				}
				resolve(true);
			});
		});
	}

	drawDiagram() : void {
		let width = this.width;
		let height = this.height;
		let ref = this;
		//console.log(this.momentNodes);
		let node_size = d3.scaleLinear();
	    	//.domain([5,10])	// we know score is in this domain
	    	//.range([1,16])
	    	//.clamp(true);
	    // parent (canvas)
	    this.graph = this.svg.append('g').classed('chartLayer', true);
	    this.graph.attr('transform', 'translate(' + [0,0] + ')');
	    // set up zoom
	    let g = this.graph;
		function zoomed() {
			g.attr('transform', d3.event.transform);
		}
		this.zoom = d3.zoom().scaleExtent([1, 20]).on("zoom", zoomed).on("end", function() {
			if (ref.activeNode)
				ref.loadChildren();
		});
		// marker definition (for future use)
		this.graph.append('defs').append('marker')
			.attr('id', 'arrow').attr('markerWidth', '10')
			.attr('markerHeight', '10').attr('refX', '0')
			.attr('refY', '3').attr('orient', 'auto')
			.attr('markerUnits', 'strokeWidth')
			.append('path').attr('d', 'M0,0 L0,6 L9,3 z')
			.attr('fill', '#000');
		// shadow definition (for future use)
		let shadow = this.graph.select('defs').append('filter')
			.attr('id', 'shadowfilter')
			.attr('x', '0')
			.attr('y', '0')
			.attr('width', '200%')
			.attr('height', '200%');
		shadow.append('feOffset').attr('result', 'offOut')
			.attr('in', 'SourceAlpha')
			.attr('dx', '20')
			.attr('dy', '20');
		shadow.append('feGaussianBlur').attr('result', 'blurOut')
			.attr('in', 'offOut')
			.attr('stdDeviation', '10');
		shadow.append('feBlend')
			.attr('in', 'SourceGraphic')
			.attr('in2', 'blurOut')
			.attr('mode', 'normal');
	    // top-level nodes
	    let nodes = this.graphNodes = this.graph.append('g').attr('class','nodes')
			.selectAll("circle")
			.data(this.momentNodes, function(d){ return d.id; } )
			.enter().append("g")
			.attr("class", "node")
			.attr("id", function(d) { return d.id; });
		// draw circle
		let circles = nodes.append("circle")
			.attr('id', function(d) { return d.id; } )
			//.attr('class', function(d) { return 'moment-map-moment'} )
			.attr('r', function(d) { return node_size(d.radius); } )
			.attr('x', width / 2)
			.attr('y', height / 2)
			.style('fill', 'rgb(216, 216, 216)')
			.style('stroke', 'rgb(131, 131, 131)')
			.style('cursor', 'pointer');
		// draw label
		let labels = nodes.append("text")
			.attr("text-anchor", "middle")
			.attr("textLength", function(d) { return 2 * d.radius - 10; })
			.classed("momentLabel", true)
			.text(function (d) { return d.text; });

		function wrap (lbl) {
			lbl.each(function () {
				let text = d3.select(this);
				//console.log(text);
				let	words = text.text().split(/\s+/).reverse(),
					word,
					line = [],
					lineNumber = 0,
					lineHeight = 1.2, // ems
					y = text.attr("y"),
					x = text.attr("x"),
					width = text.attr("textLength"),
					//dy = parseFloat(text.attr("dy")),
					dy = 0,
					tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em").style('cursor', 'pointer');
				while (word = words.pop()) {
					line.push(word);
					tspan.text(line.join(" "));
					if (tspan.node().getComputedTextLength() > width) {
						line.pop();
						tspan.text(line.join(" "));
						line = [word];
						tspan = text.append("tspan").attr("dx", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text(word).style('cursor', 'pointer');
						lineNumber++;
						if (lineNumber === 3) {
							tspan = text.append("tspan").attr("dx", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text('...').style('cursor', 'pointer');
							break;
						}
					}
				}
			});
		}
		labels.call(wrap);

		// force animation
		let ticked = function () {
			nodes.attr("x", function (d) { return d.x; })
				.attr("y", function (d) { return d.y; });
			circles.attr("cx", function (d) { return d.x; })
				.attr("cy", function (d) { return d.y; });
			labels.attr("x", function (d) { return d.x; })
				.attr("y", function (d) { return d.y; });
			labels.each(function() {
				let text = d3.select(this);
				let x = text.attr("x");
				text.selectAll("tspan").each(function() {
					let el = d3.select(this);
					el.attr("x", x);
				});
			});
		}
		this.force.nodes(this.momentNodes).on("tick", ticked);

		// define zoomed in contents
		// STUB
		let apiref = this.api;
		let spcId = this.spaceId;
		let svg = this.svg;
		let zoom = this.zoom;
		// mouse events
		nodes.on('mouseover', function(evt) {
			let el = d3.select(this).selectAll('circle');
			el.style('stroke', 'rgb(70, 70, 70)')
				.style('fill', 'rgb(160, 160, 160)');
		}).on('mouseout', function(evt) {
			let el = d3.select(this).selectAll('circle');
			el.style('stroke', 'rgb(131, 131, 131)')
				.style('fill', 'rgb(216, 216, 216)');
		}).on('click', function(evt) {
			if (ref.activeNode === evt) {
				let el = d3.select(this).selectAll('text');
				el.style('visibility', 'visible');
				// clear contents
				// stop forces
				ref.cforce.stop();
				ref.force = null;
				d3.select(this).selectAll('g').remove();
				ref.graphChildNodes = null;
				ref.graphChildLinks = null;
				// set the rest up
				evt.selected = false;
				ref.activeNode = null;
				ref.scale = 1;
				// zoom out
				svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
			} else {
				// show text on the node that we transition from
				if (ref.activeNode) {
					d3.select('g#' + ref.activeNode.id)
						.selectAll('text')
						.style('visibility', 'visible');
					ref.activeNode.selected = false;
				}
				ref.activeNode = evt;
				let el = d3.select(this).selectAll('text');
				// zoom in
				let scale = ref.scale = Math.max(1, Math.min(20, 1 / Math.min(2 * evt.radius / width, 2 * evt.radius / height)));
				let translateX = width / 2 - scale * evt.x;
				let translateY = height / 2 - scale * evt.y;
				svg.transition().duration(750)
					.call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
				
				// hide moment keywords
				el.style('visibility', 'hidden');
				evt.selected = true;
			}
		});
	}

	loadChildren() {
		let node_size = d3.scaleLinear();
		let ref = this;
		// change contents of current active node
		this.api.getMessagesBetween(this.spaceId, this.activeNode.fields['startDate'], this.activeNode.fields['endDate'], 0, 25).subscribe(msgs => {
			console.log(msgs);
			// spawn moment contents
			let links = ref.graphChildLinks = [];
			let links2 = [];
			for (let i = 0; i < msgs.length; i++) {
				this.activeNode.children[i] = new D3ForceNode(msgs[i].id, "mm1_", this.activeNode.children.length, 200, msgs[i].content, 200);
				if (i > 0) {
					let id = this.activeNode.children[i - 1].id + '-' + this.activeNode.children[i].id;
					links[i - 1] = new D3ForceLink(id, this.activeNode.children[i - 1].id, this.activeNode.children[i].id);
					links2[i - 1] = new D3ForceLink(id, this.activeNode.children[i - 1].id, this.activeNode.children[i].id);
				}
			}

			let trueScale = ref.scale * Math.max(1, msgs.length / 3);
			this.cforce = d3.forceSimulation()
				.force('charge', d3.forceManyBody())
				.force('center', d3.forceCenter(this.activeNode.x - (this.activeNode.radius / trueScale), this.activeNode.y))
				.force('collide', d3.forceCollide((d) => { return (((d.width * Math.sqrt(2) + 10) / trueScale) / 2); }).iterations(16))
				.force('x', d3.forceX(0))
				.force('y', d3.forceY(0))
				.force('link', d3.forceLink().id(function(d) { return d.id; }).distance(10 / trueScale))
				.force('link2', d3.forceLink().id(function(d) { return d.id; }).distance(100 / trueScale))
				.on("tick", cticked);

			// start drawing
			// draw links
			let lnks = d3.select('g#' + this.activeNode.id)
		    	.append('g').attr('class','links')
				.selectAll("link")
				.data(links).enter()
				.append('line')
				.attr('class', 'link')
				.attr('stroke-width', 4 / trueScale)
				.attr('stroke', 'black');
			// halflinks
			let lnks2 = d3.select('g#' + this.activeNode.id)
		    	.append('g').attr('class','halflinks')
		    	.selectAll("halflink")
				.data(links2).enter()
				.append('line')
				.attr('class', 'halflink')
				.attr('stroke-width', 4 / trueScale)
				.attr('stroke', 'black')
				.attr('marker-end', 'url(#arrow)');
			// draw nodes
		    let cnodes = this.graphChildNodes = d3.select('g#' + this.activeNode.id)
		    	.append('g').attr('class','nodes')
				.selectAll("rect")
				.data(this.activeNode.children, function(d){ return d.id; } )
				.enter().append("g")
				.attr("class", "node")
				.attr("id", function(d) { return d.id; });
			// draw rectangles
			let rects = cnodes.append("rect")
				.attr('id', function(d) { return d.id; } )
				.attr('height', function(d) { console.log(d); return node_size(d.radius / trueScale); })
				.attr('width', function(d) { return node_size(d.width / trueScale); })
				.attr('rx', function(d) { return 20 / trueScale; })
				.attr('ry', function(d) { return 20 / trueScale; })
				.attr('x', this.activeNode.x)
				.attr('y', this.activeNode.y)
				.attr('stroke-width', 2 / trueScale)
				//.attr('filter', 'url(#shadowFilter)')
				.style('fill', 'rgb(186, 207, 226)')
				.style('stroke', 'rgb(58, 58, 58)');
			// draw labels
			let clabels = cnodes.append("text")
				//.attr("text-anchor", "middle")
				.attr("textLength", function(d) { return (d.width - 40) / trueScale; })
				.classed("messageLabel", true)
				.text(function (d) { return d.text; })
				.style('font-size', 1.5 / trueScale + 'em');

			function wrap (lbl) {
				lbl.each(function () {
					let text = d3.select(this);
					//console.log(text);
					let	words = text.text().split(/\s+/).reverse(),
						word,
						line = [],
						lineNumber = 0,
						lineHeight = 1.2, // ems
						y = text.attr("y"),
						x = text.attr("x"),
						width = text.attr("textLength"),
						//dy = parseFloat(text.attr("dy")),
						dy = 0,
						tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
					while (word = words.pop()) {
						line.push(word);
						tspan.text(line.join(" "));
						if (tspan.node().getComputedTextLength() > width) {
							line.pop();
							tspan.text(line.join(" "));
							line = [word];
							tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", lineHeight + dy + "em").text(word);
							lineNumber++;
							if (lineNumber === 5) {
								tspan = text.append("tspan").attr("dx", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text('...').style('cursor', 'pointer');
								break;
							}
						}
					}
				});
			}
			clabels.call(wrap);

			// set up forces
			function cticked() {
				cnodes.attr("x", function (d) { return d.x; })
					.attr("y", function (d) { return d.y; });
				rects.attr("x", function (d) { return d.x - (d.width / 2 / trueScale); })
					.attr("y", function (d) { return d.y - (d.radius / 2 / trueScale); });
				clabels.attr("x", function (d) { return d.x - ((d.width - 40) / 2 / trueScale); })
					.attr("y", function (d) { return d.y - ((d.radius - 120) / 2 / trueScale); });
				clabels.each(function() {
					let text = d3.select(this);
					let x = text.attr("x");
					text.selectAll("tspan").each(function() {
						let el = d3.select(this);
						el.attr("x", x);
					});
				});
				lnks.attr('x1', function(d) { return d.source.x; })
					.attr('y1', function(d) { return d.source.y; })
					.attr('x2', function(d) { return d.target.x; })
					.attr('y2', function(d) { return d.target.y; });
				lnks2.attr('x1', function(d) { return d.source.x; })
					.attr('y1', function(d) { return d.source.y; })
					.attr('x2', function(d) { return (d.source.x + d.target.x) / 2; })
					.attr('y2', function(d) { return (d.source.y + d.target.y) / 2; });
			}
			this.cforce.nodes(this.activeNode.children);
			this.cforce.force("link").links(links);
			this.cforce.force("link2").links(links2);
		});
	}
}