import db from '$lib/database';
import { json, error, type RequestHandler } from '@sveltejs/kit';

export const GET = (async () => {
	try {
		const today = new Date();
		today.setUTCHours(0, 0, 0, 0);

		const todaysTraffic = await db.traffic.findFirst({
			where: {
				date: today
			}
		});

		if (todaysTraffic) {
			await db.traffic.update({
				where: {
					date: today
				},
				data: {
					count: {
						increment: 1
					}
				}
			});

			return json(200);
		}

		await db.traffic.create({
			data: {
				count: 0,
				date: today
			}
		});

		return json(200);
	} catch (e) {
		return error(400, e instanceof Error ? e.message : String(e));
	}
}) satisfies RequestHandler;
