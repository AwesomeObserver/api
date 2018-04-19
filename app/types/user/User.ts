export const type = `
  type User {
    id: String
    name: String
    avatar: String
    role: String
    weight: Int
    allows: [String]
    banned: Boolean
    unbanDate: String
    room: UserRoom
  }
`;
