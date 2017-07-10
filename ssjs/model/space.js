var Member = require('./member');

// Entity representing WW Space
function Space(_id, data) {
	console.log('<><> spawning Space object...')
	// set id
	this.id = _id;
	this.status = this.getDefault('STATUS_OFF');
	// set the rest
	if (data) {
		console.log('filling out data...');
		if (data.title)
			this.title = data.title;
		else
			this.title = '';
		if (data.description)
			this.description = data.description;
		else
			this.description = null;
		if (data.membersUpdated)
			this.membersUpdated = new Date(data.membersUpdated);
		else
			this.membersUpdated = null;
		if (data.members && data.members.items) {
			this.members = [];
			// initialize members
			for (var mem in data.members.items) {
				console.log('adding member: ' + JSON.stringify(mem));
				this.members[mem.id] = new Member(mem.id, mem.email, mem.displayName);
			}
		}
	}
}

Space.setStatus = function (stat) {
	this.status = stat;
	return this;
};

Space.getDefault = function (name) {
	switch(name) {
		case 'STATUS_OFF': return 0;
		case 'STATUS_LOADING': return 1;
		case 'STATUS_ACTIVE': return 2;
		case 'STATUS_NOT_FOUND': return 3;
		case 'STATUS_ERROR': return 4;
		default: return null;
	}
};

module.exports = Space;