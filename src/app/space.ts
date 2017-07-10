export class Space {
	id: string;
	title: string;
	description: string;
	created: Date;
	updated: Date;
	createdBy: string;
	updatedBy: string;
	membersUpdated: Date;
	state: number;

	constructor(_id: string) {
		this.id = _id;
		this.state = SPACE_STATE.INITIALIZED;
	}

	loadServerData(srvSpace: any): void {
		if (!srvSpace.status) {
			this.state = SPACE_STATE.ERROR;
			return;
		} else
			switch(srvSpace.status) {
			case SERVER_SPACE_STATE.STATUS_LOADING:
				this.state = SPACE_STATE.LOADING;
				return;
			case SERVER_SPACE_STATE.STATUS_ACTIVE:
				if (!srvSpace.title || !srvSpace.created) {
					this.state = SPACE_STATE.ERROR;
					return;
				}
				this.title = srvSpace.title;
				this.description = srvSpace.description;
				this.created = srvSpace.created;
				this.updated = srvSpace.updated;
				this.createdBy = srvSpace.createdBy.id;
				this.updatedBy = srvSpace.updatedBy.id;
				this.membersUpdated = srvSpace.membersUpdated;
				this.state = SPACE_STATE.LOADED;
				return;
			case SERVER_SPACE_STATE.STATUS_NOT_FOUND:
			case SERVER_SPACE_STATE.STATUS_ERROR:
			case SERVER_SPACE_STATE.STATUS_OFF:
			default:
				this.state = SPACE_STATE.ERROR;
				return;
			}
	}
}

export enum SPACE_STATE {
	INITIALIZED,
	LOADING,
	LOADED,
	ERROR
}

enum SERVER_SPACE_STATE {
	STATUS_OFF = 0,
	STATUS_LOADING = 1,
	STATUS_ACTIVE = 2,
	STATUS_NOT_FOUND = 3,
	STATUS_ERROR = 4
}