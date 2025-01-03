import { SECRET_INGREDIENT } from '$env/static/private';
import { deleteThumbnailFromCloudinary, uploadThumnailToCloudinary } from '$lib/cloudinary';
import db from '$lib/database';
import { formatTitleToSlug } from '$lib/utils';

import { error, json, type RequestHandler } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

interface Blog {
	title: string;
	description: string;
	tags: string[];
	thumbNail: File;
	category: string;
	content: string;
	published: boolean;
}

export const POST = (async ({ cookies, request }) => {
	const authToken = cookies.get('adminSession');

	if (!authToken) {
		error(401, {
			message: 'UnAuthorized'
		});
	}

	const claims = jwt.verify(authToken, SECRET_INGREDIENT);

	if (!claims) {
		cookies.delete('adminSession', { path: '/' });

		error(401, {
			message: 'Session Expired!'
		});
	} else {
		const formData = await request.formData();

		const data = Object.fromEntries(formData.entries());

		const parsedData = {
			...data,
			tags: JSON.parse(data.tags as string),
			published: data.published === 'true',
			thumbNail: formData.get('thumbNail') as File
		} as Blog;

		const slug = formatTitleToSlug(parsedData.title);

		const existingBlogWithSlug = await db.blog.findUnique({ where: { slug } });

		if (existingBlogWithSlug) {
			return error(400, {
				message: 'A blog with this title already exist'
			});
		}

		const author = await db.user.findUnique({ where: { authToken } });

		let cloudinaryUpload: { public_id: string; secure_url: string } | null = null;

		cloudinaryUpload = await uploadThumnailToCloudinary(parsedData.thumbNail);

		const blogTransaction = await db.$transaction(async (tx) => {
			const blog = await tx.blog.create({
				data: {
					authorId: author?.id as string,
					title: parsedData.title,
					slug,
					description: parsedData.description,
					tagsIds: parsedData.tags,
					categoryId: parsedData.category,
					thumbnail: cloudinaryUpload.secure_url,
					thumbnailPublicId: cloudinaryUpload.public_id,
					markdown: parsedData.content,
					published: parsedData.published,
					views: 0
				}
			});

			await tx.tag.updateMany({
				where: {
					id: {
						in: parsedData.tags
					}
				},
				data: {
					blogsIds: {
						push: blog.id
					}
				}
			});

			return tx.blog.findUnique({
				where: {
					id: blog.id
				},
				include: {
					tags: {
						select: {
							name: true
						}
					}
				}
			});
		});

		return json(blogTransaction);
	}
}) satisfies RequestHandler;

export const GET = (async ({ cookies }) => {
	const authToken = cookies.get('adminSession');

	if (!authToken) {
		error(400, 'Unauthorized');
	}

	try {
		const claims = jwt.verify(authToken, SECRET_INGREDIENT);

		if (!claims) {
			cookies.delete('adminSession', { path: '/' });

			error(400, 'Session Expired');
		} else {
			const admin = await db.user.findUnique({ where: { authToken } });

			if (!admin) {
				cookies.delete('adminSession', { path: '/' });

				error(400, `User doesn't exist /  Session Expired`);
			}

			const blogs = await db.blog.findMany({
				where: { authorId: admin.id },
				orderBy: {
					createdAt: 'desc'
				}
			});

			return json(blogs);
		}
	} catch (e) {
		error(400, JSON.stringify(e));
	}
}) satisfies RequestHandler;

export const DELETE = (async ({ cookies, request }) => {
	const authToken = cookies.get('adminSession');

	if (!authToken) {
		error(401, 'UnAuthorized');
	}

	try {
		const claims = jwt.verify(authToken, SECRET_INGREDIENT);

		if (!claims) {
			cookies.delete('adminSession', { path: '/' });

			error(401, 'Session Expired');
		} else {
			const id = await request.json();

			const deletedBlog = await db.$transaction(async (prisma) => {
				const blog = await prisma.blog.findUnique({
					where: { id },
					select: {
						id: true,
						tags: true,
						tagsIds: true,
						thumbnailPublicId: true
					}
				});

				if (!blog) {
					throw new Error('Blog does not exist', {
						cause: {
							status: 404
						}
					});
				}

				const relatedTags = await prisma.tag.findMany({
					where: {
						blogsIds: {
							has: blog.id
						}
					}
				});

				for (const tag of relatedTags) {
					await prisma.tag.update({
						where: {
							id: tag.id
						},
						data: {
							blogsIds: {
								set: tag.blogsIds.filter((blogId) => blogId !== blog.id)
							}
						}
					});
				}

				const deletedBlog = await prisma.blog.delete({ where: { id: blog.id } });

				return deletedBlog;
			});

			if (deletedBlog && deletedBlog.thumbnailPublicId.length > 5) {
				await deleteThumbnailFromCloudinary(deletedBlog.thumbnailPublicId);
			}

			return json(`${deletedBlog.title} have been deleted`);
		}
	} catch (e) {
		console.error(e);

		error(400, e as Error);
	}
}) satisfies RequestHandler;
