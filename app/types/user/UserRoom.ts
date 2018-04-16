export const type = `
  type UserRoom {
    role: String
    weight: Int
    allows: [String]
    banned: Boolean
    follower: Boolean
    lastFollowDate: String
    unbanDate: String
  }
`;
