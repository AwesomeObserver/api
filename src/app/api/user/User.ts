export default class {
  GG: any;

  constructor(GG) {
    this.GG = GG;
  }

  async getById(userId: string) {
    return this.getOne({ id: userId });
  }

  async getOne(where) {
    let userRepository = this.GG.DB.TO.getRepository(this.GG.Entity.User);
    return userRepository.findOne(where);
  }

  async create(userData) {
    let user = new this.GG.Entity.User();

    for (const name of Object.keys(userData) ) {
      user[name] = userData[name];
    }

    return this.GG.DB.TO.manager.save(user);
  }

  async ban() {

  }

  async setRole() {
    
  }
}