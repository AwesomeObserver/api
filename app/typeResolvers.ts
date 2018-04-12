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
		const res = access.getRole(root.role).allows;

		console.log(root.role, res);

		return res;
	},
	weight(root) {
		return access.getRole(root.role).weight;
	}
};

export const UserRoom = {
	allows(root) {
		console.log(root.role);
		return access.getRole(root.role).allows;
	},
	weight(root) {
		return access.getRole(root.role).weight;
	}
};
