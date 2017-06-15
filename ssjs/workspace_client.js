var cloudant = require('./cloudant_client'),
	https = require('https'),
	events = require('events'),
	Promise = require('promise');

var workspace = {
	urls: {
		base: "api.watsonwork.ibm.com",
		auth: "/oauth/token",
		graphql: "/graphql",
	},
	_queries: {
		GET_SPACE_INFO: "query getSpace ($spaceId: ID!) { " + 
							"space(id: $spaceId) { " + 
								"id " + 
								"title " +
								"description " + 
								"created " + 
								"updated " + 
								"createdBy { id }" + 
								"updatedBy { id }" + 
								"membersUpdated " + 
							"} " + 
						"}",
		LIST_CONVERSATION_MESSAGES_FIRST: 	"query getConversation ($convoId: ID!, $first: Int) { " + 
												"conversation(id: $convoId) { " + 
													"messages (first: $first) { " + 
														"pageInfo { " + 
															"startCursor " + 
															"endCursor " + 
															"hasPreviousPage " + 
															"hasNextPage " + 
														"} " + 
														"items { " + 
															"id " + 
															"content " + 
															"contentType " + 
															"annotations " + 
															"created " + 
															"updated " + 
															"createdBy { id extId } " + 
															"updatedBy { id extId } " + 
														"} " + 
													"} " + 
												"} " + 
											"}",
		LIST_CONVERSATION_MESSAGES_NEXT: 	"query getConversation ($convoId: ID!, $first: Int, $cursorStart: String) { " + 
												"conversation(id: $convoId) { " + 
													"messages (first: $first, after: $cursorStart) { " + 
														"pageInfo { " + 
															"startCursor " + 
															"endCursor " + 
															"hasPreviousPage " + 
															"hasNextPage " + 
														"} " + 
														"items { " + 
															"id " + 
															"content " + 
															"contentType " + 
															"annotations " + 
															"created " + 
															"updated " + 
															"createdBy { id extId } " + 
															"updatedBy { id extId } " + 
														"} " + 
													"} " + 
												"} " + 
											"}",
		LIST_CONVERSATION_USERS_FIRST: 	"query getSpace ($convoId: ID!, $first: Int) { " + 
											"space(id: $convoId) { " + 
												"members (first: $first) { " + 
													"pageInfo { " + 
														"startCursor " + 
														"endCursor " + 
														"hasPreviousPage " + 
														"hasNextPage " + 
													"} " + 
													"items { " + 
														"id " + 
														"extId " + 
														"displayName " + 
														"email " + 
														"emailAddresses " + 
														"photoUrl " + 
														"customerId " + 
														"created " + 
														"updated " + 
														"createdBy { id extId } " + 
														"updatedBy { id extId } " + 
													"} " + 
												"} " + 
											"} " + 
										"}", 
		LIST_CONVERSATION_USERS_NEXT: 	"query getSpace ($convoId: ID!, $first: Int, $cursorStart: String) { " + 
											"space(id: $convoId) { " + 
												"members (first: $first, after: $cursorStart) { " + 
													"pageInfo { " + 
														"startCursor " + 
														"endCursor " + 
														"hasPreviousPage " + 
														"hasNextPage " + 
													"} " + 
													"items { " + 
														"id " + 
														"extId " + 
														"displayName " + 
														"email " + 
														"emailAddresses " + 
														"photoUrl " + 
														"customerId " + 
														"created " + 
														"updated " + 
														"createdBy { id extId } " + 
														"updatedBy { id extId } " + 
													"} " + 
												"} " + 
											"} " + 
										"}",
	},
};

workspace.authenticate = function () {
	//var url = this.urls.base + this.urls.auth;
	if (this.isAuthenticated())
		return new Promise((resolve, reject) => {
			resolve();
		});
	return new Promise((resolvee, rejecte) => {
		cloudant.getWWCredentials().then((body) => {
			//console.log('Returned: ' + JSON.stringify(body));
			if (null !== body) {
				workspace.credentials = {
					id : body.app_id,
					secret : body.app_secret
				};
				//console.log('cred >>>' + JSON.stringify(this.credentials));
	    		console.log('Logging in to Watson Workspace...');
	    		var token = new Buffer(this.credentials.id + ":" + this.credentials.secret).toString('base64');
				var options = {
					hostname: workspace.urls.base,
					path: workspace.urls.auth,
					method: 'POST',
					headers: {
						'Authorization': "Basic " + token,
						'Content-Type': "application/x-www-form-urlencoded"
					}
				};
				//console.log("Options: " + JSON.stringify(options));
				var auth = new Promise((resolve, reject) => {
					var req = https.request(options, (res) => {
						//console.log('Status: ' + res.statusCode);
						res.setEncoding('utf-8');
						var body = "";
						res.on('data', (piece) => {
							body += piece;
						});
						res.on('end', () => {
							//console.log('Body: ' + body);
							//console.log('>>> Type: ' + typeof body);
							var response = JSON.parse(body);
							if (res.statusCode === 200) {
								resolve(response);
							} else {
								reject(new Error("Failed to authenticate with WW."));
							}
						});
					});

					req.on('error', (e) => {
						console.log("Error: " + e.message);
						console.log("Error Obj: " + JSON.stringify(e));
						reject(new Error("Failed to authenticate with WW."));
					});

					req.write("grant_type=client_credentials");
					req.end();
				});

				auth.then((auth) => {
					//console.log('>>> recording auth data: ' + JSON.stringify(auth));
					workspace.oauth = auth;
					resolvee();
				});
			}
			//workspace.onGetCredentials(err, body);
		});
	});
};

workspace.isAuthenticated = function () {
	console.log("AUTH: " + this.oauth);
	return this.oauth !== undefined && this.oauth !== null;
};

workspace.getSpaceInfo = function(_id) {
	return new Promise((resolve, reject) => {
		var reqbody = {
			operation: "getSpace",
			query: workspace._queries.GET_SPACE_INFO,
			variables: {
				spaceId: _id
			}
		};
		var options = {
			hostname: workspace.urls.base,
			path: workspace.urls.graphql,
			method: 'POST',
			headers: {
				'Authorization': "Bearer " + workspace.oauth.access_token,
				'Content-Type': "application/json"
			},
		};
		console.log('>>>>> getting space info from WW...');
		var req = https.request(options, (res) => {
			res.setEncoding('utf-8');
			var body = "";
			res.on('data', (piece) => {
				body += piece;
			});
			res.on('end', () => {
				var response = JSON.parse(body);
				if (res.statusCode === 200) {
					if (response.data)
						resolve(response.data);
					else
						resolve(null);
				} else {
					reject(new Error("Failed to get space from WW."));
				}
			});
		});
		req.on('error', (e) => {
			console.log("Error: " + e.message);
			console.log("Error Obj: " + JSON.stringify(e));
			reject(new Error("Failed to get space from WW."));
		});
		req.write(JSON.stringify(reqbody));
		req.end();
	});
};

workspace.getFirstNMessages = function (_spaceId, _N) {
	return new Promise((resolve, reject) => {
		var reqbody = {
			operation: "getConversation",
			query: workspace._queries.LIST_CONVERSATION_MESSAGES_FIRST,
			variables: {
				convoId: _spaceId,
				first: _N
			}
		};
		var options = {
			hostname: workspace.urls.base,
			path: workspace.urls.graphql,
			method: 'POST',
			headers: {
				'Authorization': "Bearer " + workspace.oauth.access_token,
				'Content-Type': "application/json"
			},
		};
		console.log('<<<< querying WW for first ' + _N + " messages in conversation " + _spaceId);
		var req = https.request(options, (res) => {
			res.setEncoding('utf-8');
			var body = "";
			res.on('data', (piece) => {
				body += piece;
			});
			res.on('end', () => {
				//console.log(">>>>> response body: " + body);
				var response = JSON.parse(body);
				if (res.statusCode === 200) {
					if (response.data)
						if (response.data.conversation)
							resolve(response.data.conversation);
						else
							resolve(null);
					else
						resolve(null);
				} else {
					reject(new Error("Failed to get messages from WW."));
				}
			});
		});
		req.on('error', (e) => {
			console.log("Error: " + e.message);
			console.log("Error Obj: " + JSON.stringify(e));
			reject(new Error("Failed to get messages from WW."));
		});
		req.write(JSON.stringify(reqbody));
		req.end();
	});
};

workspace.getNextNMessages = function(_spaceId, _N, _startCursor) {
	return new Promise((resolve, reject) => {
		var reqbody = {
			operation: "getConversation",
			query: workspace._queries.LIST_CONVERSATION_MESSAGES_NEXT,
			variables: {
				convoId: _spaceId,
				first: _N,
				cursorStart: _startCursor
			}
		};
		var options = {
			hostname: workspace.urls.base,
			path: workspace.urls.graphql,
			method: 'POST',
			headers: {
				'Authorization': "Bearer " + workspace.oauth.access_token,
				'Content-Type': "application/json"
			},
		};
		console.log('<<<< querying WW for next ' + _N + " messages in conversation " + _spaceId + " starting from cursor " + _startCursor);
		var req = https.request(options, (res) => {
			res.setEncoding('utf-8');
			var body = "";
			res.on('data', (piece) => {
				body += piece;
			});
			res.on('end', () => {
				//console.log("<><><> got: " + body);
				var response = JSON.parse(body);
				if (res.statusCode === 200) {
					if (response.data)
						if (response.data.conversation)
							resolve(response.data.conversation);
						else
							resolve(null);
					else
						resolve(null);
				} else {
					reject(new Error("Failed to get messages from WW."));
				}
			});
		});
		req.on('error', (e) => {
			console.log("Error: " + e.message);
			console.log("Error Obj: " + JSON.stringify(e));
			reject(new Error("Failed to get messages from WW."));
		});
		//console.log("---------<><><> sending: " + JSON.stringify(reqbody));
		req.write(JSON.stringify(reqbody));
		req.end();
	});
};

workspace.getFirstNUsers = function (_spaceId, _N) {
	return new Promise((resolve, reject) => {
		var reqbody = {
			operation: "getSpace",
			query: workspace._queries.LIST_CONVERSATION_USERS_FIRST,
			variables: {
				convoId: _spaceId,
				first: _N
			}
		};
		var options = {
			hostname: workspace.urls.base,
			path: workspace.urls.graphql,
			method: 'POST',
			headers: {
				'Authorization': "Bearer " + workspace.oauth.access_token,
				'Content-Type': "application/json"
			},
		};
		console.log('<<<< querying WW for first ' + _N + " users in conversation " + _spaceId);
		var req = https.request(options, (res) => {
			res.setEncoding('utf-8');
			var body = "";
			res.on('data', (piece) => {
				body += piece;
			});
			res.on('end', () => {
				console.log(">>>>> response body: " + body);
				var response = JSON.parse(body);
				if (res.statusCode === 200) {
					if (response.data)
						if (response.data.space)
							resolve(response.data.space);
						else
							resolve(null);
					else
						resolve(null);
				} else {
					reject(new Error("Failed to get members from WW."));
				}
			});
		});
		req.on('error', (e) => {
			console.log("Error: " + e.message);
			console.log("Error Obj: " + JSON.stringify(e));
			reject(new Error("Failed to get members from WW."));
		});
		req.write(JSON.stringify(reqbody));
		req.end();
	});
};

workspace.getNextNUsers = function (_spaceId, _N, _startCursor) {
	return new Promise((resolve, reject) => {
		var reqbody = {
			operation: "getSpace",
			query: workspace._queries.LIST_CONVERSATION_USERS_NEXT,
			variables: {
				convoId: _spaceId,
				first: _N,
				cursorStart: _startCursor
			}
		};
		var options = {
			hostname: workspace.urls.base,
			path: workspace.urls.graphql,
			method: 'POST',
			headers: {
				'Authorization': "Bearer " + workspace.oauth.access_token,
				'Content-Type': "application/json"
			},
		};
		console.log('<<<< querying WW for next ' + _N + " users in conversation " + _spaceId + " starting from cursor " + _startCursor);
		var req = https.request(options, (res) => {
			res.setEncoding('utf-8');
			var body = "";
			res.on('data', (piece) => {
				body += piece;
			});
			res.on('end', () => {
				//console.log(">>>>> response body: " + body);
				var response = JSON.parse(body);
				if (res.statusCode === 200) {
					if (response.data)
						if (response.data.space)
							resolve(response.data.space);
						else
							resolve(null);
					else
						resolve(null);
				} else {
					reject(new Error("Failed to get members from WW."));
				}
			});
		});
		req.on('error', (e) => {
			console.log("Error: " + e.message);
			console.log("Error Obj: " + JSON.stringify(e));
			reject(new Error("Failed to get members from WW."));
		});
		req.write(JSON.stringify(reqbody));
		req.end();
	});
};

module.exports = workspace;