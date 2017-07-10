import { Injectable } from '@angular/core';

import { MomentMap } from './moment-map';
import { DiagramDrawer } from './diagram-drawer.interface';
import { APIService } from './api.service';


declare var d3: any;

@Injectable()
export class CanvasDrawerService {
	contentId: string;
	width: number;
	height: number;
	currentOffset: any;
	currentZoom: number;
	zoomThreshold: number;
	xscale: any;
	yscale: any;
	zscale: any;
	diagram: DiagramDrawer;

	constructor( private api : APIService ) {
		this.width = 960;
		this.height = 600;
		this.zoomThreshold = 2.5;
		this.currentOffset = {
			x: 0,
			y: 0
		};
		this.currentZoom = 1.0;
	}

	setContentId(id: string) {
		this.contentId = (id.startsWith('#') ? id : '#' + id);
	}

	drawDiagram(type: DiagramType, spaceId: string) {
		console.log('d3 is');
		console.log(d3);
		this.xscale = d3.scaleLinear()
						.domain([0, this.width])
						.range([0, this.width]);
		this.yscale = d3.scaleLinear()
						.domain([0, this.height])
						.range([0, this.height]);
		this.zscale = d3.scaleLinear()
						.domain([1,6])
						.range([1,6])
						.clamp(true);
		// TODO: clear canvas here
		//
		// <--- returning to function flow
		switch(type) {
		case DiagramType.MOMENT_MAP:
			this.drawMomentMap(spaceId);
			break;
		default:
			break;
		}
	}

	private drawMomentMap(spaceId : string) : void {
		this.diagram = new MomentMap(this.contentId, this.height, this.width, spaceId);
		this.diagram.init(this.api);
	}
}

export enum DiagramType {
	MOMENT_TREE,
	MOMENT_MAP
}