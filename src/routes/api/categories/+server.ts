import { error, json, type RequestHandler } from '@sveltejs/kit';

import jwt from 'jsonwebtoken';
import { SECRET_INGREDIENT } from '$env/static/private';
import db from '$lib/database';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const GET = (async ({ cookies }) => {
	const authToken = cookies.get('adminSession');

	if (!authToken) {
		error(400, 'AunAuthorized');
	}

	try {
		const claim = jwt.verify(authToken, SECRET_INGREDIENT);

		if (!claim) {
			cookies.delete('adminSession', { path: '/' });

			error(400, 'Session Expired!');
		} else {
			const author = await db.user.findUnique({ where: { authToken } });

			const categories = await db.category.findMany({
				where: { authorId: author?.id },
				include: {
					blogs: true
				}
			});

			// console.log(categories);

			return json(categories);
		}
	} catch (e) {
		console.error('SERVER ERROR IN CATEGORIES:', e);

		if (e instanceof PrismaClientKnownRequestError) {
			switch (e.code) {
				case 'P2010':
					return error(503, {
						message: 'Database connection error - Please try again later'
					});
				case 'P2025':
					return error(404, {
						message: 'Record not found'
					});
				default:
					error(500, {
						message: 'Database error'
					});
			}
		}

		if (e instanceof jwt.JsonWebTokenError) {
			error(401, { message: 'Invalid authentication token' });
		}

		// For any other unexpected errors
		error(500, { message: 'Internal server error' });
	}
}) satisfies RequestHandler;

export const PUT = (async ({ cookies, request }) => {
	const authToken = cookies.get('adminSession');

	if (!authToken) {
		error(401, 'unAuthorized');
	}

	try {
		const claims = jwt.verify(authToken, SECRET_INGREDIENT);

		if (!claims) {
			error(401, 'Session Expired');
		}

		const author = await db.user.findUnique({ where: { authToken } });

		if (!author) {
			error(401, 'Session Expired');
		}

		const { id, name }: { id: string; name: string } = await request.json();

		const category = await db.category.findUnique({ where: { id } });

		if (!category) {
			error(404, 'Category not found');
		}

		const newCategory = await db.category.update({
			where: { id },
			data: { name }
		});

		return json(newCategory);
	} catch (e) {
		console.error(e);

		error(400, e instanceof Error ? e.message : JSON.stringify(e));
	}
}) satisfies RequestHandler;

export const DELETE = (async ({ cookies, request }) => {
	const authToken = cookies.get('adminSession');

	if (!authToken) {
		error(401, 'unAuthorized Access');
	}

	try {
		const claims = jwt.verify(authToken, SECRET_INGREDIENT);

		if (!claims) {
			error(401, 'Session Expired!');
		}

		const author = await db.user.findUnique({ where: { authToken } });

		if (!author) {
			error(401, 'Session Expired!');
		}

		const { id } = await request.json();

		const category = await db.category.findUnique({ where: { id } });

		if (!category) {
			error(404, 'Category not found');
		}

		const deletedCategory = await db.category.delete({ where: { id } });

		return json(deletedCategory);
	} catch (e) {
		console.error(e);

		error(400, e instanceof Error ? e.message : JSON.stringify(e));
	}
}) satisfies RequestHandler;
