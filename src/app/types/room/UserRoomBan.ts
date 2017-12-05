export const type = `
  type UserRoomBan {
    userId: String
    banDate: String
    unbanDate: String
    reason: String
    user: UserWithRoom
  }
`;