import * as fetch from 'node-fetch';
import { btoa } from 'core/utils';
import { broker, logger } from 'core';

export const schema = `
	payUrl: String
`;

const XSOLLA_URL = 'https://secure.xsolla.com/';
const XSOLLA_SANDBOX_URL = 'https://sandbox-secure.xsolla.com/';
const XSOLLA_SANDBOX = process.env.XSOLLA_SANDBOX;

export async function resolver(root: any, args: any, ctx: any) {
	const { userId } = ctx;

	if (!userId) {
		throw new Error('Deny');
	}

	const user = await broker.call('user.getOne', { userId });

	if (!user) {
		throw new Error('Deny');
	}

	const merchId = process.env.XSOLLA_SUB_ID;
	const projectId = parseInt(process.env.XSOLLA_PROJECT_ID, 10);
	const authKey = btoa(`${merchId}:${process.env.XSOLLA_SECRET}`);

	let xsollaOptions = {
		user: {
			id: {
				value: `${userId}`
			},
			email: {
				value: 'sygeman@gmail.com'
			}
		},
		settings: {
			project_id: projectId,
			ui: {
				theme: 'dark',
				desktop: {
					header: {
						is_visible: false
					}
				}
			}
		}
	};

	if (XSOLLA_SANDBOX) {
		xsollaOptions.settings['mode'] = 'sandbox';
	}

	const data = await fetch(
		`https://api.xsolla.com/merchant/merchants/${merchId}/token`,
		{
			method: 'POST',
			body: JSON.stringify(xsollaOptions),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Basic ${authKey}`
			}
		}
	).then((res) => res.json());

	if (!data.token) {
		logger.error(data.extended_message);
		throw new Error('Xsolla Error');
	}

	if (XSOLLA_SANDBOX) {
		return `${XSOLLA_SANDBOX_URL}paystation2/?access_token=${data.token}`;
	}

	return `${XSOLLA_URL}paystation2/?access_token=${data.token}`;
}
