export class Annotation {
	id: string;
	msgId: string;
	spaceId: string;
	created: Date;
	createdBy: string;
	fields: any[];

	constructor(inObj: any) {
		this.fields = [];
		for (let field in inObj) {
			if (typeof field !== 'string') {
				console.log("not a string: " + field + "(" + typeof field + ")");
				return;
			}
			switch(field) {
				case '_id':
					this.id = inObj[field];
					break;
				case 'annotationId':
					this.id = (this.id ? this.id : inObj[field]);
					break;
				case 'msgId':
					this.msgId = inObj[field];
					break;
				case 'created':
					this.created = inObj[field];
					break;
				case 'createdBy':
					this.createdBy = inObj[field];
					break;
				case 'spaceId':
					this.spaceId = inObj[field];
					break;
				default:
					this.fields[field] = inObj[field];
					break;
			}
		}
	}
}