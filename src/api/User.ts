export default class {
  GG: any;

  constructor(GG) {
    this.GG = GG;
  }

  async get(id) {
    let userRepository = this.GG.DB.TO.getRepository(this.GG.Entity.User);
    return userRepository.findOneById(id);
  }

  async create(name) {
    let user = new this.GG.Entity.User();
    user.name = name;

    return this.GG.DB.TO.manager.save(user);
  }
}