export const type = `
  type User {
    id: String
    name: String
    avatar: String
    role: String
    weight: Int
    allows: [AccessAction]
    banned: Boolean
    unbanDate: String
    room: UserRoom
  }
`;
