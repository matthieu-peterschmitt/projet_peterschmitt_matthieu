import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { AddFavorite, ClearFavorites, RemoveFavorite } from './favorites.actions';

export interface FavoritesStateModel {
  pollutionIds: number[];
}

@State<FavoritesStateModel>({
  name: 'favorites',
  defaults: {
    pollutionIds: [],
  },
})
@Injectable()
export class FavoritesState {
  @Selector()
  static getFavoriteIds(state: FavoritesStateModel): number[] {
    return state.pollutionIds;
  }

  @Selector()
  static getFavoritesCount(state: FavoritesStateModel): number {
    return state.pollutionIds.length;
  }

  @Selector()
  static isFavorite(state: FavoritesStateModel) {
    return (pollutionId: number) => state.pollutionIds.includes(pollutionId);
  }

  @Action(AddFavorite)
  addFavorite(ctx: StateContext<FavoritesStateModel>, action: AddFavorite) {
    const state = ctx.getState();

    // Ne pas ajouter si déjà en favoris
    if (state.pollutionIds.includes(action.pollutionId)) {
      return;
    }

    ctx.patchState({
      pollutionIds: [...state.pollutionIds, action.pollutionId],
    });
  }

  @Action(RemoveFavorite)
  removeFavorite(ctx: StateContext<FavoritesStateModel>, action: RemoveFavorite) {
    const state = ctx.getState();

    ctx.patchState({
      pollutionIds: state.pollutionIds.filter((id) => id !== action.pollutionId),
    });
  }

  @Action(ClearFavorites)
  clearFavorites(ctx: StateContext<FavoritesStateModel>) {
    ctx.patchState({
      pollutionIds: [],
    });
  }
}
