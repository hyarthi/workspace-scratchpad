import { APIService } from './api.service';

export interface DiagramDrawer {
	init( apiref : APIService ) : void;
	drawDiagram() : void;
}