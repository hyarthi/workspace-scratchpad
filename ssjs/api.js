var cloudant = require('./cloudant_client'),
	workspace = require('./workspace_client'),
	events = require('events');

var api = {
	url: "/api",
	dev: {
		url: "/api/dev",
		credential: {
			url: "/api/dev/cred",
		},
	},
	space: {
		url: "/api/space",
		functions: {
			init: "/api/space/:id/init",
		},
		activeSpaces: [],
	},
};

var API_DEFAULTS = {
	SPACE: {
		STATUS_OFF: 0,
		STATUS_LOADING: 1,
		STATUS_ACTIVE: 2,
		STATUS_NOT_FOUND: 3,
		STATUS_ERROR: 4,
	},
};

api.space.init = function(request, response) {
	console.log('>>> started initializing the space data');
	console.log('>>> checking if authenticated');
	console.log('>>>> params: ' + JSON.stringify(request.params));
	workspace.authenticate().then(() => {
		if (! workspace.isAuthenticated()) {
			// return error
			response.status(500);
			response.setHeader('Content-Type', 'application/json');
			response.write('{"status" : "Error: Failed to authenticate!"}');
			response.end();
			return;
		}
		console.log("checking space doc");
		cloudant.getSpaceDoc(request.params.id).then((convo) => {
			if (null === convo) {
				// no doc - need to load
				console.log("no doc - need to load");
				api.space.activeSpaces[request.params.id] = {
					id: request.params.id,
					status: API_DEFAULTS.SPACE.STATUS_LOADING,
				};
				// STUB
				workspace.getSpaceInfo(request.params.id).then((info) => {
					//console.log('info: ' + JSON.stringify(info));
					if (null === info) {
						// something failed
						console.log("ERROR: Space not found.");
						api.space.activeSpaces[request.params.id].status = API_DEFAULTS.SPACE.STATUS_ERROR;
						return;
					}
					api.space.activeSpaces[request.params.id] = info.space;
					api.space.activeSpaces[request.params.id].status = API_DEFAULTS.SPACE.STATUS_LOADING;
					// record the space into Cloudant/Couch
					api.space._loadSpaceIntoCoach(request.params.id);
					// TODO
				});
				//
				response.status(200);
				response.setHeader('Content-Type', 'application/json');
				response.write('{"status" : "loading"}');
				response.end();
			} else {
				console.log('FOUND LOCAL CONVO!!!');
				//convo.id = request.params.id;
				convo.status = API_DEFAULTS.SPACE.STATUS_ACTIVE;
				api.space.activeSpaces[request.params.id] = convo;
				response.status(200);
				response.setHeader('Content-Type', 'application/json');
				response.write('{"status" : "loaded"}');
				response.end();
			}
		});
	});
};

api.space._loadSpaceIntoCoach = function(id) {
	// async do in the background
	return new Promise((resolve, reject) => {
		// start collecting messages
		// first messages
		console.log("loading space into Coach/Cloudant...");
		workspace.getFirstNMessages(id, 5).then((response) => {
			//console.log(">>> got response: " + JSON.stringify(response));
			if (response.messages) {
				if (response.messages.items) {
					// process messages
					var toCloudant = [];
					for (var i = 0; i < response.messages.items.length; i++) {
						var item = response.messages.items[i];
						item.spaceId = id;
						console.log("updating item " + item.id + " in Couch/Cloudant");
						toCloudant[i] = cloudant.updateMessageDoc(item);
					}
					Promise.all(toCloudant).then(results => {
						if (results.indexOf(false) < 0) {
							console.log('no errors here!');
						} else {
							console.log('caught errors!');
							reject();
						}
						console.log("FIRST: have next page? " + response.messages.pageInfo.hasNextPage);
						if (response.messages.pageInfo.hasNextPage) {
							api.space._loadNextMessages(id, response.messages.pageInfo.endCursor).then(() => {
								// all done -> continue
								console.log();
								console.log("loading users now");
								console.log();
								// load users
								api.space._loadUsers(id).then(() => {
									// record space doc
									console.log("recording space doc into Couch/Cloudant");
									console.log("active: " + JSON.stringify(api.space.activeSpaces[id]));
									cloudant.updateSpaceDoc(api.space.activeSpaces[id]).then(result => {
										if (false === result) {
											console.log("<><><><><><><> FAILED on space!!!!");
											api.space.activeSpaces[id].status = API_DEFAULTS.STATUS_ERROR;
											reject();
										} else {
											console.log("<><><><><><><> SUCCESS!!!!");
											api.space.activeSpaces[id].status = API_DEFAULTS.STATUS_ACTIVE;
											resolve();
										}
									});
								}, () => {
									console.log("<><><><><><><> FAILED on users!!!!");
									api.space.activeSpaces[id].status = API_DEFAULTS.STATUS_ERROR;
									reject();
								});
							}, () => {
								console.log("<><><><><><><> FAILED on next messages!!!!");
								api.space.activeSpaces[id].status = API_DEFAULTS.STATUS_ERROR;
								reject();
							});
						} else {
							// no next page -> continue
							api.space._loadUsers(id).then(() => {
								// record space doc
								console.log("recording space doc into Couch/Cloudant");
								cloudant_client.updateSpaceDoc(api.space.activeSpaces[id]).then(result => {
									if (false === result) {
										console.log("<><><><><><><> FAILED on space!!!!");
										api.space.activeSpaces[id].status = API_DEFAULTS.STATUS_ERROR;
										reject();
									} else {
										console.log("<><><><><><><> SUCCESS!!!!");
										api.space.activeSpaces[id].status = API_DEFAULTS.STATUS_ACTIVE;
										resolve();
									}
								});
							}, () => {
								console.log("<><><><><><><> FAILED on users!!!!");
								api.space.activeSpaces[id].status = API_DEFAULTS.STATUS_ERROR;
								reject();
							});
						}
					});
				} else {
					console.error("Error loading data into coach - no messages to load (items).");
					api.space.activeSpaces[id].status = API_DEFAULTS.STATUS_ERROR;
					reject();
				}
			} else {
				console.error("Error loading data into coach - no messages to load.");
				api.space.activeSpaces[id].status = API_DEFAULTS.STATUS_ERROR;
				reject();
			}
		});
	});
};

api.space._loadNextMessages = function(spaceId, startCursor) {
	console.log("new starting cursor: " + startCursor);
	if (startCursor) {
		return new Promise ((resolve, reject) => {
			workspace.getNextNMessages(spaceId, 5, startCursor).then((response) => {
				// STUB
				if (response.messages) {
					if (response.messages.items) {
						// process messages
						var toCloudant = [];
						for (var i = 0; i < response.messages.items.length; i++) {
							var item = response.messages.items[i];
							item.spaceId = spaceId;
							console.log("updating item " + item.id + " in Couch/Cloudant");
							toCloudant[i] = cloudant.updateMessageDoc(item);
						}
						Promise.all(toCloudant).then(results => {
							console.log("blip!!!!!!!!!");
							if (results.indexOf(false) < 0) {
								console.log('no errors here!');
							} else {
								console.log('caught errors!');
								reject();
							}
							console.log("NEXT: have next page? " + response.messages.pageInfo.hasNextPage);
							if (response.messages.pageInfo.hasNextPage) {
								api.space._loadNextMessages(spaceId, response.messages.pageInfo.endCursor).then(() => {
									// done -> continue
									resolve();
								}, () => {
									reject();
								});
							} else {
								// done -> continue
								resolve();
							}
						});
					} else {
						console.error("Error loading data into coach - no messages to load (items).");
						reject();
					}
				} else {
					console.error("Error loading data into coach - no messages to load.");
					reject();
				}
			});
		});
	} else {
		return new Promise((resolve, reject) => {
			resolve();
			// interrupt?
		});
	}
};

api.space._loadUsers = function(spaceId) {
	console.log('started loading users');
	return new Promise((resolve, reject) => {
		workspace.getFirstNUsers(spaceId, 1).then(response => {
			if (response.members) {
				if (response.members.items) {
					var toCloudant =[];
					for (var i = 0; i < response.members.items.length; i++) {
						var item = response.members.items[i];
						console.log("updating member " + item.id + " in Couch/Cloudant");
						toCloudant[i] = cloudant.updateMemberDoc(item);
					}
					Promise.all(toCloudant).then(results => {
						if (results.indexOf(false) < 0) {
							console.log('no errors here!');
						} else {
							console.log('caught errors!');
							reject();
						}
						console.log("NEXT: have next page? " + response.members.pageInfo.hasNextPage);
						if (response.members.pageInfo.hasNextPage) {
							api.space._loadNextUsers(spaceId, response.members.pageInfo.endCursor).then(() => {
								resolve();
							}, () => {
								reject();
							});
						} else {
							// done -> continue
							resolve();
						}
					});
				} else {
					console.error("Error loading data into coach - no members to load (items).");
					reject();
				}
			} else {
				console.error("Error loading data into coach - no members to load.");
				reject();
			}
		});
	});
};

api.space._loadNextUsers = function(spaceId, startCursor) {
	if (startCursor) {
		return new Promise((resolve, reject) => {
			workspace.getNextNUsers(spaceId, 1, startCursor).then(response => {
				if (response.members) {
					if (response.members.items) {
						var toCloudant = [];
						for (var i = 0; i < response.members.items.length; i++) {
							var item = response.members.items[i];
							console.log("updating member " + item.id + " in Couch/Cloudant");
							toCloudant[i] = cloudant.updateMemberDoc(item);
						}
						Promise.all(toCloudant).then(results => {
							if (results.indexOf(false) < 0) {
								console.log('no errors here!');
							} else {
								console.log('caught errors!');
								reject();
							}
							console.log("NEXT: have next page? " + response.members.pageInfo.hasNextPage);
							if (response.members.pageInfo.hasNextPage) {
								api.space._loadNextUsers(spaceId, response.members.pageInfo.endCursor).then(() => {
									resolve();
								}, () => {
									reject();
								});
							} else {
								// done -> continue
								resolve();
							}
						});
					} else {
						console.error("Error loading data into coach - no members to load (items).");
						reject();
					}
				} else {
					console.error("Error loading data into coach - no members to load.");
					reject();
				}
			});
		});
	} else
		return new Promise(resolve => {
			resolve();
			// interrupt?
		});
};

module.exports = api;