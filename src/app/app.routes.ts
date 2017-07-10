import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRoutes } from '@angular/router';

import { CanvasComponent } from './canvas.component';
import { ErrorComponent } from './error.component';

const appRoutes: Routes = [
	{ path: 'canvas/:id', component: CanvasComponent },
	{ path: 'error', component: ErrorComponent },
	{ path: '', redirectTo: '/error', pathMatch: 'full' },
	{ path: '**', redirectTo: '/error' }
];

@NgModule({
	imports: [
		RouterModule.forRoot(appRoutes)
	],
	exports: [
		RouterModule
	]
})
export class AppRoutesModule {}