import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { Annotation } from './annotation';
import { Message } from './message';

@Injectable()
export class APIService {
	private urlList: any;

	constructor(private http: Http) {
		this.urlList = {
			base: '/api',
			space: {
				base: '/api/space',
				init: function (id: string) : string {
					return '/api/space/' + encodeURI(id) + '/init'
				},
				at: function (id: string) : string {
					return '/api/space/' + encodeURI(id);
				}
			},
			annotations: {
				get: function(spaceId: string, start: number, limit: number) : string {
					return '/api/space/' + encodeURI(spaceId) + '/ant?start=' + start + '&limit=' + limit;
				},
				at: function(id: string, spaceId?: string) : string {
					//STUB
					return null;
				},
				moments: {
					get: function(spaceId: string, start: number, limit: number): string {
						return '/api/space/' + encodeURI(spaceId) + '/moments?start=' + start + '&limit=' + limit;
					}
				}
			},
			messages: {
				between: function(spaceId: string, startDate: Date, endDate: Date, start: number, limit: number): string {
					return '/api/space/' + encodeURI(spaceId) + '/messages?startDate=' + startDate.getTime() + '&endDate=' + endDate.getTime() + '&start=' + start + '&limit=' + limit;
				}
			},
		};
	}

	initSpace(id: string): Observable<any> {
		return this.http.get(this.urlList.space.init(id)).map<Response, any>(response => {
			let resp = response.json();
			return resp;
		});
	}

	getAnnotations(spaceId: string, type?: AnnotationType, start?: number, limit?: number): Observable<Annotation[]> {
		let skip = (start ? start : 0);
		let lmt = (limit ? limit : 25);
		let qUrl = "";
		switch(type) {
		case AnnotationType.MOMENT:
			qUrl = this.urlList.annotations.moments.get(spaceId, skip, lmt);
			break;
		case AnnotationType.ALL:
		default:
			qUrl = this.urlList.annotations.get(spaceId, skip, lmt);
			break;
		}
		return this.http.get(qUrl).map<Response, Annotation[]>(response => {
			if (response.status !== 200) {
				return null;
			}
			let resp = response.json();
			let annos: Annotation[] = [];
			//console.log(resp);
			for (let i = 0; i < resp.length; i++) {
				let anno = new Annotation(resp[i]);
				annos[i] = anno;
			}

			return annos;
		});
	}

	getMessagesBetween(spaceId: string, startDate: any, endDate: any, start?: number, limit?: number): Observable<Message[]> {
		let skip = (start ? start : 0);
		let lmt = (limit ? limit : 25);
		let qUrl = this.urlList.messages.between(spaceId, new Date(startDate), new Date(endDate), start, limit);
		return this.http.get(qUrl).map<Response, Message[]>(response => {
			if (response.status !== 200) {
				return null;
			}
			let resp = response.json();
			let msgs: Message[] = [];
			for (let i = 0; i < resp.length; i++) {
				let msg = new Message(resp[i]);
				msgs[i] = msg;
			}
			return msgs;
		});
	}
}

export enum AnnotationType {
	ALL,
	MOMENT,
}