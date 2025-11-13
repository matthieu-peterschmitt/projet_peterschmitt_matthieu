import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";
import { Store } from "@ngxs/store";
import { FavoritesState } from "./state/favorites.state";

@Component({
	selector: "app-root",
	imports: [CommonModule, RouterOutlet, RouterLink],
	templateUrl: "./app.html",
	styleUrl: "./app.css",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
	private readonly store = inject(Store);

	protected readonly title = "TP4 - Gestion des Pollutions";
	protected readonly favoritesCount = computed(() =>
		this.store.selectSnapshot(FavoritesState.getFavoritesCount)
	);
}
