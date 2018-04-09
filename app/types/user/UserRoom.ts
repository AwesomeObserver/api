export const type = `
  type UserRoom {
    role: String
    weight: Int
    allows: [AccessAction]
    banned: Boolean
    follower: Boolean
    lastFollowDate: String
    unbanDate: String
  }
`;
