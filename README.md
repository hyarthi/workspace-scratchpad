# Watson Workspace ScratchPad Mockup Prototype

This application implements a concept of visualizing [Watson Workspace][] data.

The app runs locally and caches data from an available workspace.

In order to get access to the workspace, an application key needs to be issued from the Watson Work [developer dashboard][] and fed into the app.

App requires local instance of CouchDB or BlueMix Cloudant instance.

Runs on a local instance of Node.js, but can also run in BlueMix Node.js runtime (in theory).

## Run the app locally

1. [Install Node.js][]
+ cd into this project's root directory
+ Copy the value for the VCAP_SERVICES envirionment variable from the application running in Bluemix and paste it in a `vcap-local.json` file
+ Run `npm install` to install the app's dependencies
+ Run `npm start` to start the app
+ Access the running app in a browser at <http://localhost:6001>

[Install Node.js]: https://nodejs.org/en/download/
[Watson Workspace]: https://workspace.ibm.com
[developer dashboard]: https://developer.watsonwork.ibm.com/apps
