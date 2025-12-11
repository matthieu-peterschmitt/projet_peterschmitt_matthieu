export class AddFavorite {
  static readonly type = '[Favorites] Add Favorite';
  constructor(public pollutionId: number) {}
}

export class RemoveFavorite {
  static readonly type = '[Favorites] Remove Favorite';
  constructor(public pollutionId: number) {}
}

export class ClearFavorites {
  static readonly type = '[Favorites] Clear All Favorites';
}
