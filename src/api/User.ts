export default class {
  GG: any;

  constructor(GG) {
    this.GG = GG;
  }

  async get(id) {
    await this.GG.API.Access.check();

    return {
      id: 1,
      name: 'Sygeman'
    };
  }
}