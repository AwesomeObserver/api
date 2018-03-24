export const Room = {
  avatar(root) {
    if (root.avatar) {
      return root.avatar;
    } else {
      return 'https://ravepro.ams3.digitaloceanspaces.com/logo.jpg';
    }
  }
}