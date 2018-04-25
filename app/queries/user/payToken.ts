import * as fetch from 'node-fetch';
import { btoa } from 'core/utils';

export const schema = `
  payToken: String
`;

export async function resolver(root: any, args: any, ctx: any) {
	const { userId } = ctx;

	if (!userId) {
		throw new Error('Deny');
	}

	const authKey = btoa(`32919:${process.env.XSOLLA_SECRET}`);

	const data = await fetch(
		'https://api.xsolla.com/merchant/merchants/32919/token',
		{
			method: 'POST',
			body: JSON.stringify({
				user: {
					id: {
						value: `${userId}`
					},
					email: {
						value: 'sygeman@gmail.com'
					}
				},
				settings: {
					project_id: 20327,
					ui: {
						theme: 'dark',
						desktop: {
							header: {
								is_visible: false
							}
						}
					}
				}
			}),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Basic ${authKey}`
			}
		}
	).then((res) => res.json());

	return data.token;
}
