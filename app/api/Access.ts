import {
  merge,
  mergeWith,
  assignIn,
  uniq
} from 'lodash';

import * as allActions from 'app/access/actions';
import * as allRoles from 'app/access/roles';
import rolesWeight from 'app/access/weight';

const isBoolean = (val) => typeof val === 'boolean';

export class AccessAPI {

  actionMask = {
    // Нужна ли инфа о пользователе в контексте
    context: false,
    // Cлабые роли не могут применить действие на более сильные
    hierarchy: true,
    // Можно ли применть действие к себе
    self: false,
  };

  roles = {};

  constructor() {
    Object.keys(allRoles).forEach(roleName => {
      const roleData = allRoles[roleName];
    
      let roleWIP = Object.assign({}, roleData);
    
      if (roleData.extend) {
        roleWIP = this.extendRole(roleData);
      }
    
      this.roles[roleName] = roleWIP;
    });
  }
  
  getActionData(action) {
    const actionWithoutMask = allActions[action.group][action.name];
    return assignIn({}, this.actionMask, actionWithoutMask);
  }
  
  extendRole(roleData) {
    let roleWIP = Object.assign({}, roleData);
    const mergeRoleData = this.getRole(roleWIP.extend);
  
    delete roleWIP.extend;
  
    return merge({}, mergeRoleData, roleWIP);
  }
  
  mergeRoles(roles) {
    return this.mergeRolesData(Object.values(this.getRolesData(roles)));  
  }
  
  mergeRolesData(rolesData) {
    return mergeWith({}, ...rolesData, function(objValue, srcValue) {
      if (isBoolean(objValue) || isBoolean(srcValue)) {
        return objValue || srcValue;
      }
    });
  }
  
  getRole(role) {
    return this.roles[role];
  }
  
  getRolesWeight(roles) {
    let max = -1;
  
    roles.forEach(role => {
      const current = rolesWeight.findIndex(name => name == role);
  
      if (current > max) {
        max = current;
      }
    });
  
    return max;
  }

  getRolesData(roles) {
    return roles.map(roleName => this.getRole(roleName));
  }

  checkAccessByRolesData(action, roles) {
    const rolesData = this.mergeRoles(roles);
    const groupData = rolesData.rules[action.group];
  
    if (!groupData) return false;
    if (groupData.ignore) return true;
    if (!groupData.actions) return false
  
    return groupData.actions[action.name];
  }

  checkAccessByActionData(action, current, context) {
    const actionData = this.getActionData(action);
  
    if (!actionData.context) return true;
    if (actionData.self && (current.id == context.id)) return true;
    if (!actionData.self && (current.id == context.id)) return false;
  
    if (actionData.hierarchy) {
      const currentWeight = this.getRolesWeight(current.roles);
      const contextWeight = this.getRolesWeight(context.roles);
      
      if (currentWeight <= contextWeight) {
        return false;
      }
    }
  
    return true;
  }

  userDataFormatHack(user) {
    if (user.room) {
      return Object.assign({}, user, {
        id: user.site.id,
        roles: uniq([user.site.role, user.room.role]),
        banned: user.site.banned || user.room.banned
      });
    }
  
    return Object.assign({}, user, {
      roles: [user.role],
      banned: user.banned
    });
  }

  check(
    action: {
      group: string,
      name: string
    },
    current,
    context?
  ) {
    if (current) {
      current = this.userDataFormatHack(current);
    } else {
      current = {
        id: 0,
        roles: ['guest'],
        banned: false
      }
    }
  
    if (context) {
      context = this.userDataFormatHack(context);
    }
  
    if (current.banned) {
      return false;
    }
  
    const accessByRolesData = this.checkAccessByRolesData(action, current.roles);
    if (!accessByRolesData) return false;
  
    const accessByActionData = this.checkAccessByActionData(action, current, context);
    if (!accessByActionData) return false;

    return true;
  }
}