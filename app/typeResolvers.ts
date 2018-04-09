import { access } from 'core/access';

export const Room = {
	avatar(root) {
		if (root.avatar) {
			return root.avatar;
		} else {
			return 'https://ravepro.ams3.digitaloceanspaces.com/logo.jpg';
		}
	}
};

export const User = {
	allows(root) {
		return access.getRole(root.role).allows;
	},
	weight(root) {
		return access.getRole(root.role).weight;
	}
};

export const UserRoom = {
	allows(root) {
		return access.getRole(root.role).allows;
	},
	weight(root) {
		return access.getRole(root.role).weight;
	}
};
