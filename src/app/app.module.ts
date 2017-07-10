import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
<<<<<<< HEAD
import { FormsModule } from '@angular/forms';
//import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { AppRoutesModule } from './app.routes';
import { APIService } from './api.service';
import { CanvasComponent } from './canvas.component';
import { ErrorComponent } from './error.component';

/*const appRoutes: Routes = [
	{ path: '', redirectTo: '/error', pathMatch: 'full' },
	{ path: 'canvas/:id', component: CanvasComponent },
	{ path: 'error', component: ErrorComponent },
	{ path: '**', redirectTo: '/error' }
];*/

//const routingProviders: any[] = [];

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpModule,
		AppRoutesModule
		//routingProviders,
		//RouterModule.forRoot(appRoutes, {enableTracing: true})
	],
	declarations: [
		AppComponent,
		CanvasComponent,
		ErrorComponent
	],
	providers: [ APIService ],
	bootstrap: [ AppComponent ]
=======

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
>>>>>>> origin/master
})
export class AppModule { }
