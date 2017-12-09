import { TypeORMConnect } from 'core/db';
import { User as UserEntity } from 'app/entity/User';

export class UserClass {

  async getById(userId: number) {
    return this.getOne({ id: userId });
  }

  async getOne(where) {
    const TypeORM = await TypeORMConnect;
    let userRepository = TypeORM.getRepository(UserEntity);
    return userRepository.findOne(where);
  }

  async create(userData) {
    let user = new UserEntity();

    for (const name of Object.keys(userData) ) {
      user[name] = userData[name];
    }

    const TypeORM = await TypeORMConnect;
    return TypeORM.manager.save(user);
  }

  async ban() {

  }

  async setRole() {
    
  }
}

export const User = new UserClass();