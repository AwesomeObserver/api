export default class {

  GG: any;

  constructor(GG) {
    this.GG = GG;
  }

  getCount(roomId: string) {
    const usersCount = 0;
    const guestsCount = 0;

    return {
      connectionsCount: usersCount + guestsCount,
      usersCount,
      guestsCount,
    };
  }
}