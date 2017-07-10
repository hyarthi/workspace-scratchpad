webpackJsonp([1],{

/***/ "./src async recursive":
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = "./src async recursive";

/***/ }),

/***/ "./src/app/annotation.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Annotation; });
var Annotation = (function () {
    function Annotation(inObj) {
        this.fields = [];
        for (var field in inObj) {
            if (typeof field !== 'string') {
                console.log("not a string: " + field + "(" + typeof field + ")");
                return;
            }
            switch (field) {
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
    return Annotation;
}());

//# sourceMappingURL=annotation.js.map

/***/ }),

/***/ "./src/app/api.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__("./node_modules/@angular/http/@angular/http.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_catch__ = __webpack_require__("./node_modules/rxjs/add/operator/catch.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_catch___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_catch__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_map__ = __webpack_require__("./node_modules/rxjs/add/operator/map.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_map__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__annotation__ = __webpack_require__("./src/app/annotation.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__message__ = __webpack_require__("./src/app/message.ts");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return APIService; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return AnnotationType; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var APIService = (function () {
    function APIService(http) {
        this.http = http;
        this.urlList = {
            base: '/api',
            space: {
                base: '/api/space',
                init: function (id) {
                    return '/api/space/' + encodeURI(id) + '/init';
                },
                at: function (id) {
                    return '/api/space/' + encodeURI(id);
                }
            },
            annotations: {
                get: function (spaceId, start, limit) {
                    return '/api/space/' + encodeURI(spaceId) + '/ant?start=' + start + '&limit=' + limit;
                },
                at: function (id, spaceId) {
                    //STUB
                    return null;
                },
                moments: {
                    get: function (spaceId, start, limit) {
                        return '/api/space/' + encodeURI(spaceId) + '/moments?start=' + start + '&limit=' + limit;
                    }
                }
            },
            messages: {
                between: function (spaceId, startDate, endDate, start, limit) {
                    return '/api/space/' + encodeURI(spaceId) + '/messages?startDate=' + startDate.getTime() + '&endDate=' + endDate.getTime() + '&start=' + start + '&limit=' + limit;
                }
            },
        };
    }
    APIService.prototype.initSpace = function (id) {
        return this.http.get(this.urlList.space.init(id)).map(function (response) {
            var resp = response.json();
            return resp;
        });
    };
    APIService.prototype.getAnnotations = function (spaceId, type, start, limit) {
        var skip = (start ? start : 0);
        var lmt = (limit ? limit : 25);
        var qUrl = "";
        switch (type) {
            case AnnotationType.MOMENT:
                qUrl = this.urlList.annotations.moments.get(spaceId, skip, lmt);
                break;
            case AnnotationType.ALL:
            default:
                qUrl = this.urlList.annotations.get(spaceId, skip, lmt);
                break;
        }
        return this.http.get(qUrl).map(function (response) {
            if (response.status !== 200) {
                return null;
            }
            var resp = response.json();
            var annos = [];
            //console.log(resp);
            for (var i = 0; i < resp.length; i++) {
                var anno = new __WEBPACK_IMPORTED_MODULE_4__annotation__["a" /* Annotation */](resp[i]);
                annos[i] = anno;
            }
            return annos;
        });
    };
    APIService.prototype.getMessagesBetween = function (spaceId, startDate, endDate, start, limit) {
        var skip = (start ? start : 0);
        var lmt = (limit ? limit : 25);
        var qUrl = this.urlList.messages.between(spaceId, new Date(startDate), new Date(endDate), start, limit);
        return this.http.get(qUrl).map(function (response) {
            if (response.status !== 200) {
                return null;
            }
            var resp = response.json();
            var msgs = [];
            for (var i = 0; i < resp.length; i++) {
                var msg = new __WEBPACK_IMPORTED_MODULE_5__message__["a" /* Message */](resp[i]);
                msgs[i] = msg;
            }
            return msgs;
        });
    };
    return APIService;
}());
APIService = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["c" /* Injectable */])(),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["b" /* Http */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_http__["b" /* Http */]) === "function" && _a || Object])
], APIService);

var AnnotationType;
(function (AnnotationType) {
    AnnotationType[AnnotationType["ALL"] = 0] = "ALL";
    AnnotationType[AnnotationType["MOMENT"] = 1] = "MOMENT";
})(AnnotationType || (AnnotationType = {}));
var _a;
//# sourceMappingURL=api.service.js.map

/***/ }),

/***/ "./src/app/app.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "./src/app/app.component.html":
/***/ (function(module, exports) {

module.exports = "<!--The whole content below can be removed with the new code.-->\n<div style=\"width:100%;height:100%\">\n\t<router-outlet></router-outlet>\n</div>"

/***/ }),

/***/ "./src/app/app.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var AppComponent = (function () {
    function AppComponent() {
    }
    return AppComponent;
}());
AppComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_0" /* Component */])({
        selector: 'app-root',
        template: __webpack_require__("./src/app/app.component.html"),
        styles: [__webpack_require__("./src/app/app.component.css")],
    })
], AppComponent);

//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ "./src/app/app.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__("./node_modules/@angular/platform-browser/@angular/platform-browser.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__("./node_modules/@angular/forms/@angular/forms.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_http__ = __webpack_require__("./node_modules/@angular/http/@angular/http.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__app_component__ = __webpack_require__("./src/app/app.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__app_routes__ = __webpack_require__("./src/app/app.routes.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__api_service__ = __webpack_require__("./src/app/api.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__canvas_component__ = __webpack_require__("./src/app/canvas.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__error_component__ = __webpack_require__("./src/app/error.component.ts");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};



//import { RouterModule, Routes } from '@angular/router';






/*const appRoutes: Routes = [
    { path: '', redirectTo: '/error', pathMatch: 'full' },
    { path: 'canvas/:id', component: CanvasComponent },
    { path: 'error', component: ErrorComponent },
    { path: '**', redirectTo: '/error' }
];*/
//const routingProviders: any[] = [];
var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["b" /* NgModule */])({
        imports: [
            __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
            __WEBPACK_IMPORTED_MODULE_2__angular_forms__["a" /* FormsModule */],
            __WEBPACK_IMPORTED_MODULE_3__angular_http__["a" /* HttpModule */],
            __WEBPACK_IMPORTED_MODULE_5__app_routes__["a" /* AppRoutesModule */]
            //routingProviders,
            //RouterModule.forRoot(appRoutes, {enableTracing: true})
        ],
        declarations: [
            __WEBPACK_IMPORTED_MODULE_4__app_component__["a" /* AppComponent */],
            __WEBPACK_IMPORTED_MODULE_7__canvas_component__["a" /* CanvasComponent */],
            __WEBPACK_IMPORTED_MODULE_8__error_component__["a" /* ErrorComponent */]
        ],
        providers: [__WEBPACK_IMPORTED_MODULE_6__api_service__["a" /* APIService */]],
        bootstrap: [__WEBPACK_IMPORTED_MODULE_4__app_component__["a" /* AppComponent */]]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ "./src/app/app.routes.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__canvas_component__ = __webpack_require__("./src/app/canvas.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__error_component__ = __webpack_require__("./src/app/error.component.ts");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppRoutesModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};




var appRoutes = [
    { path: 'canvas/:id', component: __WEBPACK_IMPORTED_MODULE_2__canvas_component__["a" /* CanvasComponent */] },
    { path: 'error', component: __WEBPACK_IMPORTED_MODULE_3__error_component__["a" /* ErrorComponent */] },
    { path: '', redirectTo: '/error', pathMatch: 'full' },
    { path: '**', redirectTo: '/error' }
];
var AppRoutesModule = (function () {
    function AppRoutesModule() {
    }
    return AppRoutesModule;
}());
AppRoutesModule = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["b" /* NgModule */])({
        imports: [
            __WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* RouterModule */].forRoot(appRoutes)
        ],
        exports: [
            __WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* RouterModule */]
        ]
    })
], AppRoutesModule);

//# sourceMappingURL=app.routes.js.map

/***/ }),

/***/ "./src/app/canvas-drawer.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__moment_map__ = __webpack_require__("./src/app/moment-map.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__api_service__ = __webpack_require__("./src/app/api.service.ts");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return CanvasDrawerService; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return DiagramType; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var CanvasDrawerService = (function () {
    function CanvasDrawerService(api) {
        this.api = api;
        this.width = 960;
        this.height = 600;
        this.zoomThreshold = 2.5;
        this.currentOffset = {
            x: 0,
            y: 0
        };
        this.currentZoom = 1.0;
    }
    CanvasDrawerService.prototype.setContentId = function (id) {
        this.contentId = (id.startsWith('#') ? id : '#' + id);
    };
    CanvasDrawerService.prototype.drawDiagram = function (type, spaceId) {
        console.log('d3 is');
        console.log(d3);
        this.xscale = d3.scaleLinear()
            .domain([0, this.width])
            .range([0, this.width]);
        this.yscale = d3.scaleLinear()
            .domain([0, this.height])
            .range([0, this.height]);
        this.zscale = d3.scaleLinear()
            .domain([1, 6])
            .range([1, 6])
            .clamp(true);
        // TODO: clear canvas here
        //
        // <--- returning to function flow
        switch (type) {
            case DiagramType.MOMENT_MAP:
                this.drawMomentMap(spaceId);
                break;
            default:
                break;
        }
    };
    CanvasDrawerService.prototype.drawMomentMap = function (spaceId) {
        this.diagram = new __WEBPACK_IMPORTED_MODULE_1__moment_map__["a" /* MomentMap */](this.contentId, this.height, this.width, spaceId);
        this.diagram.init(this.api);
    };
    return CanvasDrawerService;
}());
CanvasDrawerService = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["c" /* Injectable */])(),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_2__api_service__["a" /* APIService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__api_service__["a" /* APIService */]) === "function" && _a || Object])
], CanvasDrawerService);

var DiagramType;
(function (DiagramType) {
    DiagramType[DiagramType["MOMENT_TREE"] = 0] = "MOMENT_TREE";
    DiagramType[DiagramType["MOMENT_MAP"] = 1] = "MOMENT_MAP";
})(DiagramType || (DiagramType = {}));
var _a;
//# sourceMappingURL=canvas-drawer.service.js.map

/***/ }),

/***/ "./src/app/canvas.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "div.canvas {\r\n\tborder-width: 5px !important;\r\n\tborder-color: #000 !important;\r\n\twidth: 100%;\r\n\theight: 100%;\r\n\tmin-height: 10cm;\r\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "./src/app/canvas.component.html":
/***/ (function(module, exports) {

module.exports = "<div>\r\n\t<div #canvas id=\"canvas\" class=\"canvas\">\r\n\t\t<div #canvasPlaceholder id=\"canvasPlaceholder\">\r\n\t\t\t<img #canvasPlaceholderImg id=\"canvasPlaceholderImg\" src=\"/images/loading.gif\" />\r\n\t\t</div>\r\n\t\t<div #canvasContent id=\"canvasContent\" style=\"display:none;\"></div>\r\n\t</div>\r\n</div>"

/***/ }),

/***/ "./src/app/canvas.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__api_service__ = __webpack_require__("./src/app/api.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__canvas_drawer_service__ = __webpack_require__("./src/app/canvas-drawer.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__space__ = __webpack_require__("./src/app/space.ts");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CanvasComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var CanvasComponent = (function () {
    function CanvasComponent(api, route, router, renderer, app, drawer) {
        this.api = api;
        this.route = route;
        this.router = router;
        this.renderer = renderer;
        this.app = app;
        this.drawer = drawer;
        // default diagram type
        this.diagram = __WEBPACK_IMPORTED_MODULE_3__canvas_drawer_service__["a" /* DiagramType */].MOMENT_TREE;
        // init
        this.annos = [];
    }
    CanvasComponent.prototype.ngOnInit = function () {
        var _this = this;
        // get :id
        this.sub = this.route.params.subscribe(function (params) {
            // if no :id then no sense to continue
            if (!params['id']) {
                _this.router.navigateByUrl('/error');
                return;
            }
            // we have an :id
            // init space
            _this.space = new __WEBPACK_IMPORTED_MODULE_4__space__["a" /* Space */](params['id']);
            // DEBUG
            console.log("canvas: " + typeof _this.canvasRef);
            console.log("placeholder: " + typeof _this.placeholderRef);
            console.log("content: " + typeof _this.contentRef);
            // load space
            _this.loadSpaceData();
            //this.app.tick();
        });
    };
    CanvasComponent.prototype.loadSpaceData = function () {
        var _this = this;
        if (this.space.state === __WEBPACK_IMPORTED_MODULE_4__space__["b" /* SPACE_STATE */].LOADED) {
            // reload
            //STUB
        }
        else {
            // initialize
            this.api.initSpace(this.space.id).subscribe(function (spc) {
                // process 
                console.log('processing space data...');
                // fill content div
                console.log('setting content');
                _this.space.loadServerData(spc);
                //this.renderer.setProperty(this.contentRef.nativeElement, 'innerHTML', JSON.stringify(this.space));
                // switch contents
                console.log('hiding placeholder');
                console.log(_this.placeholderRef);
                _this.renderer.setStyle(_this.placeholderRef.nativeElement, 'display', 'none');
                console.log('showing content');
                _this.renderer.setStyle(_this.contentRef.nativeElement, 'display', 'block');
                console.log('start drawing');
                _this.drawer.setContentId('canvasContent');
                _this.drawer.drawDiagram(__WEBPACK_IMPORTED_MODULE_3__canvas_drawer_service__["a" /* DiagramType */].MOMENT_MAP, _this.space.id);
            }, function (err) {
                // process error
                // STUB - error handler here
                console.log('ERROR!!!!');
                console.log(err);
            });
        }
    };
    return CanvasComponent;
}());
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_1" /* ViewChild */])('canvas', { read: __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */] }),
    __metadata("design:type", typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */]) === "function" && _a || Object)
], CanvasComponent.prototype, "canvasRef", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_1" /* ViewChild */])('canvasPlaceholder', { read: __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */] }),
    __metadata("design:type", typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */]) === "function" && _b || Object)
], CanvasComponent.prototype, "placeholderRef", void 0);
__decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_1" /* ViewChild */])('canvasContent', { read: __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */] }),
    __metadata("design:type", typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* ElementRef */]) === "function" && _c || Object)
], CanvasComponent.prototype, "contentRef", void 0);
CanvasComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_0" /* Component */])({
        template: __webpack_require__("./src/app/canvas.component.html"),
        styles: [__webpack_require__("./src/app/canvas.component.css")],
        providers: [__WEBPACK_IMPORTED_MODULE_2__api_service__["a" /* APIService */], __WEBPACK_IMPORTED_MODULE_3__canvas_drawer_service__["b" /* CanvasDrawerService */]]
    }),
    __metadata("design:paramtypes", [typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_2__api_service__["a" /* APIService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__api_service__["a" /* APIService */]) === "function" && _d || Object, typeof (_e = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["a" /* ActivatedRoute */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_router__["a" /* ActivatedRoute */]) === "function" && _e || Object, typeof (_f = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]) === "function" && _f || Object, typeof (_g = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["_2" /* Renderer2 */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["_2" /* Renderer2 */]) === "function" && _g || Object, typeof (_h = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["l" /* ApplicationRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["l" /* ApplicationRef */]) === "function" && _h || Object, typeof (_j = typeof __WEBPACK_IMPORTED_MODULE_3__canvas_drawer_service__["b" /* CanvasDrawerService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3__canvas_drawer_service__["b" /* CanvasDrawerService */]) === "function" && _j || Object])
], CanvasComponent);

var _a, _b, _c, _d, _e, _f, _g, _h, _j;
//# sourceMappingURL=canvas.component.js.map

/***/ }),

/***/ "./src/app/d3-force-link.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return D3ForceLink; });
var D3ForceLink = (function () {
    function D3ForceLink(in_id, src, tgt, wght) {
        this.id = in_id;
        this.source = src;
        this.target = tgt;
        this.weight = (wght ? wght : 1);
    }
    return D3ForceLink;
}());

//# sourceMappingURL=d3-force-link.js.map

/***/ }),

/***/ "./src/app/d3-force-node.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return D3ForceNode; });
var D3ForceNode = (function () {
    function D3ForceNode(in_id, cpref, idx, r, txt, w) {
        this.id = cpref + in_id;
        this.index = idx;
        this.radius = r;
        this.text = (txt ? txt : '');
        this.fields = [];
        this.selected = false;
        this.children = [];
        this.width = (w ? w : undefined);
    }
    return D3ForceNode;
}());

//# sourceMappingURL=d3-force-node.js.map

/***/ }),

/***/ "./src/app/error.component.html":
/***/ (function(module, exports) {

module.exports = "<h1>ERROR!!!!!!</h1>"

/***/ }),

/***/ "./src/app/error.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ErrorComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var ErrorComponent = (function () {
    function ErrorComponent() {
    }
    return ErrorComponent;
}());
ErrorComponent = __decorate([
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_0" /* Component */])({
        template: __webpack_require__("./src/app/error.component.html"),
    })
], ErrorComponent);

//# sourceMappingURL=error.component.js.map

/***/ }),

/***/ "./src/app/message.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Message; });
var Message = (function () {
    function Message(inObj) {
        for (var field in inObj) {
            if (typeof field !== 'string') {
                console.log("not a string: " + field + "(" + typeof field + ")");
                return;
            }
            switch (field) {
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
    return Message;
}());

//# sourceMappingURL=message.js.map

/***/ }),

/***/ "./src/app/moment-map.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__api_service__ = __webpack_require__("./src/app/api.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__d3_force_node__ = __webpack_require__("./src/app/d3-force-node.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__d3_force_link__ = __webpack_require__("./src/app/d3-force-link.ts");
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MomentMap; });



var MomentMap = (function () {
    function MomentMap(cId, cH, cW, spcId) {
        this.canvasId = cId;
        this.height = cH;
        this.width = cW;
        this.spaceId = spcId;
    }
    MomentMap.prototype.init = function (apiref) {
        var _this = this;
        this.api = apiref;
        this.scale = 1;
        // init force layout
        this.force = d3.forceSimulation()
            .force('charge', d3.forceManyBody())
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collide', d3.forceCollide(function (d) { return d.radius + 10; }).iterations(16))
            .force('x', d3.forceX(0))
            .force('y', d3.forceY(0));
        this.svg = d3.select(this.canvasId).append("svg")
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("id", "graph");
        //.attr("viewBox", "0 0 " + this.width + " " + this.height )
        //.attr("preserveAspectRatio", "xMidYMid meet");
        // init top-level moments
        this.momentNodes = [];
        this.loadMoments().then(function () {
            _this.drawDiagram();
        });
    };
    MomentMap.prototype.loadMoments = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.api.getAnnotations(_this.spaceId, __WEBPACK_IMPORTED_MODULE_0__api_service__["b" /* AnnotationType */].MOMENT, 0, 25).subscribe(function (annos) {
                console.log("annos: " + annos.length);
                for (var i = 0; i < annos.length; i++) {
                    // get moment's weight
                    var weight = 0;
                    if (annos[i].fields["participants"])
                        for (var j = 0; j < annos[i].fields["participants"].length; j++) {
                            weight += annos[i].fields["participants"][j].messageCount;
                        }
                    // get moment's labels
                    var text = '';
                    if (annos[i].fields["momentSummary"] && annos[i].fields["momentSummary"]["phrases"])
                        for (var j = 0; j < annos[i].fields["momentSummary"]["phrases"].length; j++) {
                            text += (j === 0 ? '' : ', ') + annos[i].fields["momentSummary"]["phrases"][j].label;
                        }
                    _this.momentNodes[i] = new __WEBPACK_IMPORTED_MODULE_1__d3_force_node__["a" /* D3ForceNode */](annos[i].id, "mm0_", _this.momentNodes.length, (100 + (10 * (weight - 5))), text);
                    // get moment's start & end message dates
                    if (annos[i].fields["startMessage"] && annos[i].fields["startMessage"]["published"])
                        _this.momentNodes[i].fields["startDate"] = annos[i].fields["startMessage"]["published"];
                    if (annos[i].fields["endMessage"] && annos[i].fields["endMessage"]["published"])
                        _this.momentNodes[i].fields["endDate"] = annos[i].fields["endMessage"]["published"];
                }
                resolve(true);
            });
        });
    };
    MomentMap.prototype.drawDiagram = function () {
        var width = this.width;
        var height = this.height;
        var ref = this;
        //console.log(this.momentNodes);
        var node_size = d3.scaleLinear();
        //.domain([5,10])	// we know score is in this domain
        //.range([1,16])
        //.clamp(true);
        // parent (canvas)
        this.graph = this.svg.append('g').classed('chartLayer', true);
        this.graph.attr('transform', 'translate(' + [0, 0] + ')');
        // set up zoom
        var g = this.graph;
        function zoomed() {
            g.attr('transform', d3.event.transform);
        }
        this.zoom = d3.zoom().scaleExtent([1, 20]).on("zoom", zoomed).on("end", function () {
            if (ref.activeNode)
                ref.loadChildren();
        });
        // marker definition (for future use)
        this.graph.append('defs').append('marker')
            .attr('id', 'arrow').attr('markerWidth', '10')
            .attr('markerHeight', '10').attr('refX', '0')
            .attr('refY', '3').attr('orient', 'auto')
            .attr('markerUnits', 'strokeWidth')
            .append('path').attr('d', 'M0,0 L0,6 L9,3 z')
            .attr('fill', '#000');
        // shadow definition (for future use)
        var shadow = this.graph.select('defs').append('filter')
            .attr('id', 'shadowfilter')
            .attr('x', '0')
            .attr('y', '0')
            .attr('width', '200%')
            .attr('height', '200%');
        shadow.append('feOffset').attr('result', 'offOut')
            .attr('in', 'SourceAlpha')
            .attr('dx', '20')
            .attr('dy', '20');
        shadow.append('feGaussianBlur').attr('result', 'blurOut')
            .attr('in', 'offOut')
            .attr('stdDeviation', '10');
        shadow.append('feBlend')
            .attr('in', 'SourceGraphic')
            .attr('in2', 'blurOut')
            .attr('mode', 'normal');
        // top-level nodes
        var nodes = this.graphNodes = this.graph.append('g').attr('class', 'nodes')
            .selectAll("circle")
            .data(this.momentNodes, function (d) { return d.id; })
            .enter().append("g")
            .attr("class", "node")
            .attr("id", function (d) { return d.id; });
        // draw circle
        var circles = nodes.append("circle")
            .attr('id', function (d) { return d.id; })
            .attr('r', function (d) { return node_size(d.radius); })
            .attr('x', width / 2)
            .attr('y', height / 2)
            .style('fill', 'rgb(216, 216, 216)')
            .style('stroke', 'rgb(131, 131, 131)')
            .style('cursor', 'pointer');
        // draw label
        var labels = nodes.append("text")
            .attr("text-anchor", "middle")
            .attr("textLength", function (d) { return 2 * d.radius - 10; })
            .classed("momentLabel", true)
            .text(function (d) { return d.text; });
        function wrap(lbl) {
            lbl.each(function () {
                var text = d3.select(this);
                //console.log(text);
                var words = text.text().split(/\s+/).reverse(), word, line = [], lineNumber = 0, lineHeight = 1.2, // ems
                y = text.attr("y"), x = text.attr("x"), width = text.attr("textLength"), 
                //dy = parseFloat(text.attr("dy")),
                dy = 0, tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em").style('cursor', 'pointer');
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("dx", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text(word).style('cursor', 'pointer');
                        lineNumber++;
                        if (lineNumber === 3) {
                            tspan = text.append("tspan").attr("dx", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text('...').style('cursor', 'pointer');
                            break;
                        }
                    }
                }
            });
        }
        labels.call(wrap);
        // force animation
        var ticked = function () {
            nodes.attr("x", function (d) { return d.x; })
                .attr("y", function (d) { return d.y; });
            circles.attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; });
            labels.attr("x", function (d) { return d.x; })
                .attr("y", function (d) { return d.y; });
            labels.each(function () {
                var text = d3.select(this);
                var x = text.attr("x");
                text.selectAll("tspan").each(function () {
                    var el = d3.select(this);
                    el.attr("x", x);
                });
            });
        };
        this.force.nodes(this.momentNodes).on("tick", ticked);
        // define zoomed in contents
        // STUB
        var apiref = this.api;
        var spcId = this.spaceId;
        var svg = this.svg;
        var zoom = this.zoom;
        // mouse events
        nodes.on('mouseover', function (evt) {
            var el = d3.select(this).selectAll('circle');
            el.style('stroke', 'rgb(70, 70, 70)')
                .style('fill', 'rgb(160, 160, 160)');
        }).on('mouseout', function (evt) {
            var el = d3.select(this).selectAll('circle');
            el.style('stroke', 'rgb(131, 131, 131)')
                .style('fill', 'rgb(216, 216, 216)');
        }).on('click', function (evt) {
            if (ref.activeNode === evt) {
                var el = d3.select(this).selectAll('text');
                el.style('visibility', 'visible');
                // clear contents
                // stop forces
                ref.cforce.stop();
                ref.force = null;
                d3.select(this).selectAll('g').remove();
                ref.graphChildNodes = null;
                ref.graphChildLinks = null;
                // set the rest up
                evt.selected = false;
                ref.activeNode = null;
                ref.scale = 1;
                // zoom out
                svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
            }
            else {
                // show text on the node that we transition from
                if (ref.activeNode) {
                    d3.select('g#' + ref.activeNode.id)
                        .selectAll('text')
                        .style('visibility', 'visible');
                    ref.activeNode.selected = false;
                }
                ref.activeNode = evt;
                var el = d3.select(this).selectAll('text');
                // zoom in
                var scale = ref.scale = Math.max(1, Math.min(20, 1 / Math.min(2 * evt.radius / width, 2 * evt.radius / height)));
                var translateX = width / 2 - scale * evt.x;
                var translateY = height / 2 - scale * evt.y;
                svg.transition().duration(750)
                    .call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
                // hide moment keywords
                el.style('visibility', 'hidden');
                evt.selected = true;
            }
        });
    };
    MomentMap.prototype.loadChildren = function () {
        var _this = this;
        var node_size = d3.scaleLinear();
        var ref = this;
        // change contents of current active node
        this.api.getMessagesBetween(this.spaceId, this.activeNode.fields['startDate'], this.activeNode.fields['endDate'], 0, 25).subscribe(function (msgs) {
            console.log(msgs);
            // spawn moment contents
            var links = ref.graphChildLinks = [];
            var links2 = [];
            for (var i = 0; i < msgs.length; i++) {
                _this.activeNode.children[i] = new __WEBPACK_IMPORTED_MODULE_1__d3_force_node__["a" /* D3ForceNode */](msgs[i].id, "mm1_", _this.activeNode.children.length, 200, msgs[i].content, 200);
                if (i > 0) {
                    var id = _this.activeNode.children[i - 1].id + '-' + _this.activeNode.children[i].id;
                    links[i - 1] = new __WEBPACK_IMPORTED_MODULE_2__d3_force_link__["a" /* D3ForceLink */](id, _this.activeNode.children[i - 1].id, _this.activeNode.children[i].id);
                    links2[i - 1] = new __WEBPACK_IMPORTED_MODULE_2__d3_force_link__["a" /* D3ForceLink */](id, _this.activeNode.children[i - 1].id, _this.activeNode.children[i].id);
                }
            }
            var trueScale = ref.scale * Math.max(1, msgs.length / 3);
            _this.cforce = d3.forceSimulation()
                .force('charge', d3.forceManyBody())
                .force('center', d3.forceCenter(_this.activeNode.x - (_this.activeNode.radius / trueScale), _this.activeNode.y))
                .force('collide', d3.forceCollide(function (d) { return (((d.width * Math.sqrt(2) + 10) / trueScale) / 2); }).iterations(16))
                .force('x', d3.forceX(0))
                .force('y', d3.forceY(0))
                .force('link', d3.forceLink().id(function (d) { return d.id; }).distance(10 / trueScale))
                .force('link2', d3.forceLink().id(function (d) { return d.id; }).distance(100 / trueScale))
                .on("tick", cticked);
            // start drawing
            // draw links
            var lnks = d3.select('g#' + _this.activeNode.id)
                .append('g').attr('class', 'links')
                .selectAll("link")
                .data(links).enter()
                .append('line')
                .attr('class', 'link')
                .attr('stroke-width', 4 / trueScale)
                .attr('stroke', 'black');
            // halflinks
            var lnks2 = d3.select('g#' + _this.activeNode.id)
                .append('g').attr('class', 'halflinks')
                .selectAll("halflink")
                .data(links2).enter()
                .append('line')
                .attr('class', 'halflink')
                .attr('stroke-width', 4 / trueScale)
                .attr('stroke', 'black')
                .attr('marker-end', 'url(#arrow)');
            // draw nodes
            var cnodes = _this.graphChildNodes = d3.select('g#' + _this.activeNode.id)
                .append('g').attr('class', 'nodes')
                .selectAll("rect")
                .data(_this.activeNode.children, function (d) { return d.id; })
                .enter().append("g")
                .attr("class", "node")
                .attr("id", function (d) { return d.id; });
            // draw rectangles
            var rects = cnodes.append("rect")
                .attr('id', function (d) { return d.id; })
                .attr('height', function (d) { console.log(d); return node_size(d.radius / trueScale); })
                .attr('width', function (d) { return node_size(d.width / trueScale); })
                .attr('rx', function (d) { return 20 / trueScale; })
                .attr('ry', function (d) { return 20 / trueScale; })
                .attr('x', _this.activeNode.x)
                .attr('y', _this.activeNode.y)
                .attr('stroke-width', 2 / trueScale)
                .style('fill', 'rgb(186, 207, 226)')
                .style('stroke', 'rgb(58, 58, 58)');
            // draw labels
            var clabels = cnodes.append("text")
                .attr("textLength", function (d) { return (d.width - 40) / trueScale; })
                .classed("messageLabel", true)
                .text(function (d) { return d.text; })
                .style('font-size', 1.5 / trueScale + 'em');
            function wrap(lbl) {
                lbl.each(function () {
                    var text = d3.select(this);
                    //console.log(text);
                    var words = text.text().split(/\s+/).reverse(), word, line = [], lineNumber = 0, lineHeight = 1.2, // ems
                    y = text.attr("y"), x = text.attr("x"), width = text.attr("textLength"), 
                    //dy = parseFloat(text.attr("dy")),
                    dy = 0, tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
                    while (word = words.pop()) {
                        line.push(word);
                        tspan.text(line.join(" "));
                        if (tspan.node().getComputedTextLength() > width) {
                            line.pop();
                            tspan.text(line.join(" "));
                            line = [word];
                            tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", lineHeight + dy + "em").text(word);
                            lineNumber++;
                            if (lineNumber === 5) {
                                tspan = text.append("tspan").attr("dx", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text('...').style('cursor', 'pointer');
                                break;
                            }
                        }
                    }
                });
            }
            clabels.call(wrap);
            // set up forces
            function cticked() {
                cnodes.attr("x", function (d) { return d.x; })
                    .attr("y", function (d) { return d.y; });
                rects.attr("x", function (d) { return d.x - (d.width / 2 / trueScale); })
                    .attr("y", function (d) { return d.y - (d.radius / 2 / trueScale); });
                clabels.attr("x", function (d) { return d.x - ((d.width - 40) / 2 / trueScale); })
                    .attr("y", function (d) { return d.y - ((d.radius - 120) / 2 / trueScale); });
                clabels.each(function () {
                    var text = d3.select(this);
                    var x = text.attr("x");
                    text.selectAll("tspan").each(function () {
                        var el = d3.select(this);
                        el.attr("x", x);
                    });
                });
                lnks.attr('x1', function (d) { return d.source.x; })
                    .attr('y1', function (d) { return d.source.y; })
                    .attr('x2', function (d) { return d.target.x; })
                    .attr('y2', function (d) { return d.target.y; });
                lnks2.attr('x1', function (d) { return d.source.x; })
                    .attr('y1', function (d) { return d.source.y; })
                    .attr('x2', function (d) { return (d.source.x + d.target.x) / 2; })
                    .attr('y2', function (d) { return (d.source.y + d.target.y) / 2; });
            }
            _this.cforce.nodes(_this.activeNode.children);
            _this.cforce.force("link").links(links);
            _this.cforce.force("link2").links(links2);
        });
    };
    return MomentMap;
}());

//# sourceMappingURL=moment-map.js.map

/***/ }),

/***/ "./src/app/space.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Space; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return SPACE_STATE; });
var Space = (function () {
    function Space(_id) {
        this.id = _id;
        this.state = SPACE_STATE.INITIALIZED;
    }
    Space.prototype.loadServerData = function (srvSpace) {
        if (!srvSpace.status) {
            this.state = SPACE_STATE.ERROR;
            return;
        }
        else
            switch (srvSpace.status) {
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
    };
    return Space;
}());

var SPACE_STATE;
(function (SPACE_STATE) {
    SPACE_STATE[SPACE_STATE["INITIALIZED"] = 0] = "INITIALIZED";
    SPACE_STATE[SPACE_STATE["LOADING"] = 1] = "LOADING";
    SPACE_STATE[SPACE_STATE["LOADED"] = 2] = "LOADED";
    SPACE_STATE[SPACE_STATE["ERROR"] = 3] = "ERROR";
})(SPACE_STATE || (SPACE_STATE = {}));
var SERVER_SPACE_STATE;
(function (SERVER_SPACE_STATE) {
    SERVER_SPACE_STATE[SERVER_SPACE_STATE["STATUS_OFF"] = 0] = "STATUS_OFF";
    SERVER_SPACE_STATE[SERVER_SPACE_STATE["STATUS_LOADING"] = 1] = "STATUS_LOADING";
    SERVER_SPACE_STATE[SERVER_SPACE_STATE["STATUS_ACTIVE"] = 2] = "STATUS_ACTIVE";
    SERVER_SPACE_STATE[SERVER_SPACE_STATE["STATUS_NOT_FOUND"] = 3] = "STATUS_NOT_FOUND";
    SERVER_SPACE_STATE[SERVER_SPACE_STATE["STATUS_ERROR"] = 4] = "STATUS_ERROR";
})(SERVER_SPACE_STATE || (SERVER_SPACE_STATE = {}));
//# sourceMappingURL=space.js.map

/***/ }),

/***/ "./src/environments/environment.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
// The file contents for the current environment will overwrite these during build.
var environment = {
    production: false
};
//# sourceMappingURL=environment.js.map

/***/ }),

/***/ "./src/main.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__ = __webpack_require__("./node_modules/@angular/platform-browser-dynamic/@angular/platform-browser-dynamic.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_app_module__ = __webpack_require__("./src/app/app.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment__ = __webpack_require__("./src/environments/environment.ts");




if (__WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].production) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["a" /* enableProdMode */])();
}
__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_2__app_app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("./src/main.ts");


/***/ })

},[0]);
//# sourceMappingURL=main.bundle.js.map