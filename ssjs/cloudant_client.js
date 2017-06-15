var fs = require('fs'),
    Promise = require('promise');

var cloudant_client = {
	defaults: {
		ww_binding_user_doc_id: "ww_binding_user",
	},
	credentials: {
		dbName: "ww_scratchpad",
	},
	connection: {},
};

cloudant_client.getDBCredentialsUrl = function(jsonData) {
    var vcapServices = JSON.parse(jsonData);
    // Pattern match to find the first instance of a Cloudant service in
    // VCAP_SERVICES. If you know your service key, you can access the
    // service credentials directly by using the vcapServices object.
    for (var vcapService in vcapServices) {
        if (vcapService.match(/cloudant/i)) {
            return vcapServices[vcapService][0].credentials.url;
        }
    }
}

cloudant_client.initDBConnection = function() {
    //When running on Bluemix, this variable will be set to a json object
    //containing all the service credentials of all the bound services
    if (process.env.VCAP_SERVICES) {
        this.credentials.url = this.getDBCredentialsUrl(process.env.VCAP_SERVICES);
    } else { //When running locally, the VCAP_SERVICES will not be set

        // When running this app locally you can get your Cloudant credentials
        // from Bluemix (VCAP_SERVICES in "cf env" output or the Environment
        // Variables section for an app in the Bluemix console dashboard).
        // Once you have the credentials, paste them into a file called vcap-local.json.
        // Alternately you could point to a local database here instead of a
        // Bluemix service.
        // url will be in this format: https://username:password@xxxxxxxxx-bluemix.cloudant.com
         this.credentials.url = this.getDBCredentialsUrl(fs.readFileSync("hyarthi-scratchpad_vcap.json", "utf-8"));
    }

    this.connection = require('cloudant')(this.credentials.url);

    // check if DB exists if not create
    this.connection.db.create(this.credentials.dbName, function(err, res) {
        if (err) {
            console.log('Could not create new db: ' + cloudant_client.credentials.dbName + ', it might already exist.');
        }
    });

    this.db = this.connection.use(this.credentials.dbName);
}

cloudant_client.initDBConnection();

cloudant_client.getWWCredentials = function(callback) {
    if(this.db !== null) {
        console.log('Querying Couch/Cloudant...');
        return new Promise((resolve, reject) => {
            this.db.get('ww_app_id', (err, body) => {
                if (err) {
                    console.log('Error: ' + err);
                    reject(err);
                }
                resolve(body);
            });
        });
        //this.db.get('ww_app_id', callback);
    } else {
        console.log('Could not get WW credentials - no DB connection');
        return new Promise((resolve, reject) => {
            reject(new Error('Could not get WW credentials - no DB connection'));
        });
    }
};

cloudant_client.getSpaceDoc = function(id) {
    if (this.db !== null) {
        console.log('>>> Getting space doc...');
        return new Promise((resolve, reject) => {
            cloudant_client.db.get(cloudant_client.parseDocId(id, 'SPC'), function (err, body) {
                if (err) {
                    console.log('error - ' + err);
                    // does not exist?
                    resolve(null);
                } else {
                    console.log('resolving body...');
                    resolve(body);
                }
            });
        });
    } else {
        console.log('Could not get space doc - no DB connection');
        return new Promise((resolve, reject) => {
            reject(new Error('Could not get space doc - no DB connection'));
        });
    }
};

cloudant_client.updateMessageDoc = function (doc) {
    if (this.db !== null) {
        console.log('>>> Updating message doc...');
        return new Promise((resolve, reject) => {
            cloudant_client.db.get(cloudant_client.parseDocId(doc.id, 'MSG'), function (err, body) {
                var indoc = {
                    _id: cloudant_client.parseDocId(doc.id, 'MSG'),
                    spaceId: cloudant_client.parseDocId(doc.spaceId, 'SPC'),
                    content: doc.content,
                    contentType: doc.contentType,
                    created: new Date(doc.created),
                    updated: new Date(doc.updated)
                };
                if (!err)
                    indoc._rev = body._rev; // exists -> update
                else 
                    console.log("error - " + err);  // doesn't exist -> insert
                if (doc.createdBy && doc.createdBy.id) {
                    indoc.createdBy = cloudant_client.parseDocId(doc.createdBy.id, 'USR');
                } else {
                    indoc.createdBy = null;
                }
                if (doc.updatedBy && doc.updatedBy.id) {
                    indoc.updatedBy = cloudant_client.parseDocId(doc.updatedBy.id, 'USR');
                }
                cloudant_client.db.insert(indoc, (er, bdy) => {
                    if (er) {
                        console.log('error - ' + er);
                        resolve(false);
                        // does not exist?
                    } else {
                        console.log("------> success: " + JSON.stringify(bdy));
                        // insert annotation docs
                        console.log("---> starting to insert annotation docs...");
                        var annos = [];
                        for (var i = 0; i < doc.annotations.length; i++) {
                            var item = JSON.parse(doc.annotations[i]);
                            item.spaceId = cloudant_client.parseDocId(doc.spaceId, 'SPC');
                            item.msgId = cloudant_client.parseDocId(doc.id, 'MSG');
                            // fix dates
                            cloudant_client._fixAnnoDates(item);
                            annos[i] = cloudant_client.updateAnnotationDoc(item);
                        }
                        Promise.all(annos).then(results => {
                            //console.log('anno update results: ' + annos);
                            if (results.indexOf(false) < 0) {
                                console.log('no errors in annos!');
                                resolve(true);
                            } else {
                                console.log('caught errors in anno!');
                                resolve(false);
                            }
                        });
                        //resolve(true);
                    }
                });
            });
        });
    } else {
        console.log('Could not update message doc - no DB connection');
        return new Promise((resolve) => {
            resolve(false);
        });
    }
};

cloudant_client._fixAnnoDates = function (anno) {
    //console.log();
    //console.log("checking for created(" + typeof anno.created + ")");
    if (anno.created && typeof anno.created === 'number') {
        anno.created = new Date(anno.created);
    }
    //console.log("checking for updated(" + typeof anno.updated + ")");
    //console.log();
    if (anno.updated && typeof anno.updated === 'number') {
        anno.updated = new Date(anno.updated);
    }
};

cloudant_client.updateAnnotationDoc = function (doc) {
    //console.log("STUB: " + JSON.stringify(doc));
    if (this.db !== null) {
        console.log("Updating annotation doc...");
        return new Promise((resolve, reject) => {
            console.log("checking annotation with id " + doc.annotationId);
            cloudant_client.db.get(cloudant_client.parseDocId(doc.annotationId, 'ANT'), (err, body) => {
                //console.log("BING!");
                doc._id = cloudant_client.parseDocId(doc.annotationId, 'ANT');
                if (!err)
                    doc._rev = body._rev;
                else
                    console.log('anno error - ' + err);
                cloudant_client.db.insert(doc, (er, bdy) => {
                    if (er) {
                        console.log('anno insert error - ' + er);
                        resolve(false);
                    } else {
                        console.log("------> success: " + JSON.stringify(bdy));
                        resolve(true);
                    }
                });
            });
        });
    } else {
        console.log('Could not update message doc - no DB connection');
        return new Promise((resolve) => {
            resolve(false);
        });
    }
};

cloudant_client.updateMemberDoc = function (doc) {
    return new Promise(resolve => {
        if (cloudant_client.db === null) {
            console.log('Could not update member doc - no DB connection');
            resolve (false);
        }
        console.log("Updating member doc...");
       // console.log('checking');
        cloudant_client.db.get(cloudant_client.parseDocId(doc.id, 'USR'), (err, body) => {
            doc._id = cloudant_client.parseDocId(doc.id, 'USR');
            if (!err)
                doc._rev = body._rev;
            else
                console.log('member error - ' + err);
            cloudant_client.db.insert(doc, (er, bdy) => {
                if (er) {
                    console.log('member insert error - ' + er);
                    resolve(false);
                } else {
                    console.log("------> success: " + JSON.stringify(bdy));
                    resolve(true);
                }
            });
        });
    });
};

cloudant_client.updateSpaceDoc = function (doc) {
    return new Promise(resolve => {
        if (cloudant_client.db === null) {
            console.log('Could not update space doc - no DB connection');
            resolve (false);
        }
        console.log("Updating space doc...");
        cloudant_client.db.get(cloudant_client.parseDocId(doc.id, 'SPC'), (err, body) => {
            doc._id = cloudant_client.parseDocId(doc.id, 'SPC');
            if (!err)
                doc._rev = body._rev;
            else
                console.log("space error - " + err);
            delete doc.status;
            cloudant_client.db.insert(doc, (er, bdy) => {
                if (er) {
                    console.log('space insert error - ' + er);
                    resolve(false);
                } else {
                    console.log("------> success: " + JSON.stringify(bdy));
                    resolve(true);
                }
            });
        });
    });
}

cloudant_client.getMessageDoc = function (id) {
    return new Promise((resolve, reject) => {
            //console.log("promise 1");
            cloudant_client.db.get(cloudant_client.parseDocId(doc.id, 'MSG'), function (err, body) {
                if (err) {
                    console.log('error - ' + err);
                    resolve(null);
                } else {
                    console.log("check body: " + JSON.stringify(body));
                    resolve(body);
                }
            });
        });
};

cloudant_client.parseDocId = function (id, type) {
    var prefix = "";
    switch(type) {
        case 'MSG':
            prefix = "msg_";
            break;
        case 'USR':
            prefix = "usr_";
            break;
        case 'ANT':
            prefix = "ant_";
            break;
        case 'SPC':
            prefix = "spc_";
            break;
        default:
            console.log("WARNING: Unrecognized type (" + type + ")");
            break;
    }
    return id.startsWith(prefix) ? id : prefix + id;
};

module.exports = cloudant_client;