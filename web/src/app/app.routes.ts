import type { Routes } from "@angular/router";

export const routes: Routes = [
	{
		path: "",
		redirectTo: "/users",
		pathMatch: "full",
	},
	{
		path: "pollutions",
		loadComponent: () =>
			import("./components/pollution-list/pollution-list.component").then(
				(m) => m.PollutionListComponent,
			),
	},
	{
		path: "pollution/new",
		loadComponent: () =>
			import("./components/pollution-form/pollution-form.component").then(
				(m) => m.PollutionFormComponent,
			),
	},
	{
		path: "pollution/:id",
		loadComponent: () =>
			import("./components/pollution-detail/pollution-detail.component").then(
				(m) => m.PollutionDetailComponent,
			),
	},
	{
		path: "pollution/:id/edit",
		loadComponent: () =>
			import("./components/pollution-edit/pollution-edit.component").then(
				(m) => m.PollutionEditComponent,
			),
	},
	{
		path: "users",
		loadComponent: () =>
			import("./components/user-list/user-list.component").then(
				(m) => m.UserListComponent,
			),
	},
	{
		path: "user/new",
		loadComponent: () =>
			import("./components/user-form/user-form.component").then(
				(m) => m.UserFormComponent,
			),
	},
	{
		path: "favorites",
		loadComponent: () =>
			import("./components/favorites/favorites.component").then(
				(m) => m.FavoritesComponent,
			),
	},
	{
		path: "**",
		redirectTo: "/pollutions",
	},
];
