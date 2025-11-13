import { provideHttpClient } from "@angular/common/http";
import {
    type ApplicationConfig,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { withNgxsStoragePlugin } from "@ngxs/storage-plugin";
import { provideStore } from "@ngxs/store";

import { routes } from "./app.routes";
import { FavoritesState } from "./state/favorites.state";

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideZonelessChangeDetection(),
		provideRouter(routes),
		provideHttpClient(),
		provideStore(
			[FavoritesState],
			withNgxsStoragePlugin({
				keys: ['favorites'],
			})
		),
	],
};
