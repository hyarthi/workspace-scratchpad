import { Component, OnInit, Renderer2, ViewChild, ElementRef, AfterContentInit, ApplicationRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { APIService } from './api.service';
import { CanvasDrawerService, DiagramType } from './canvas-drawer.service';
import { Space, SPACE_STATE } from './space';
import { Annotation } from './annotation';

@Component({
	templateUrl: './canvas.component.html',
	styleUrls: ['./canvas.component.css'],
	providers: [ APIService, CanvasDrawerService ]
})
export class CanvasComponent implements OnInit {

	space: Space;
	private sub: any;
	@ViewChild('canvas', {read: ElementRef}) canvasRef: ElementRef;
	@ViewChild('canvasPlaceholder', {read: ElementRef}) placeholderRef: ElementRef;
	@ViewChild('canvasContent', {read: ElementRef}) contentRef: ElementRef;
	diagram: DiagramType;
	annos: Annotation[];

	constructor(private api: APIService, private route: ActivatedRoute, private router: Router, private renderer: Renderer2, private app: ApplicationRef, private drawer: CanvasDrawerService) {
		// default diagram type
		this.diagram = DiagramType.MOMENT_TREE;
		// init
		this.annos = [];
	}

	ngOnInit() {
		// get :id
		this.sub = this.route.params.subscribe(params => {
			// if no :id then no sense to continue
			if (!params['id']) {
				this.router.navigateByUrl('/error');
				return;
			}
			// we have an :id
			// init space
			this.space = new Space(params['id']);
			// DEBUG
			console.log("canvas: " + typeof this.canvasRef);
			console.log("placeholder: " + typeof this.placeholderRef);
			console.log("content: " + typeof this.contentRef);
			// load space
			this.loadSpaceData();
			//this.app.tick();
		});
	}

	loadSpaceData(): void {
		if (this.space.state === SPACE_STATE.LOADED) {
			// reload
			//STUB
		} else {
			// initialize
			this.api.initSpace(this.space.id).subscribe(spc => {
				// process 
				console.log('processing space data...');
				// fill content div
				console.log('setting content');
				this.space.loadServerData(spc);
				//this.renderer.setProperty(this.contentRef.nativeElement, 'innerHTML', JSON.stringify(this.space));
				// switch contents
				console.log('hiding placeholder');
				console.log(this.placeholderRef);
				this.renderer.setStyle(this.placeholderRef.nativeElement, 'display', 'none');
				console.log('showing content');
				this.renderer.setStyle(this.contentRef.nativeElement, 'display', 'block');
				console.log('start drawing');
				this.drawer.setContentId('canvasContent');
				this.drawer.drawDiagram(DiagramType.MOMENT_MAP, this.space.id);
			}, err => {
				// process error
				// STUB - error handler here
				console.log('ERROR!!!!');
				console.log(err);
			});
		}
	}


}