export class Message {
	id: string;
	content: any;
	contentType: string;
	created: Date;
	updated: Date;
	createdBy: string;
	spaceId: string;

	constructor(inObj: any) {
		for (let field in inObj) {
			if (typeof field !== 'string') {
				console.log("not a string: " + field + "(" + typeof field + ")");
				return;
			}
			switch(field) {
				case '_id':
					this.id = inObj[field];
					break;
				case 'created':
					this.created = inObj[field];
					break;
				case 'updated':
					this.updated = inObj[field];
					break;
				case 'createdBy':
					this.createdBy = inObj[field];
					break;
				case 'spaceId':
					this.spaceId = inObj[field];
					break;
				case 'content':
					this.content = inObj[field];
					break;
				case 'contentType':
					this.contentType = inObj[field];
					break;
				default:
					break;
			}
		}
	}
}