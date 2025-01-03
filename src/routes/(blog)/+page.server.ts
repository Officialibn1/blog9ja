import type { PageServerLoad } from './$types';

export const load = (async ({ fetch }) => {
	try {
		const response = await fetch(`/api/public/blogs`);

		const blogs = await response.json();

		return { blogs };
	} catch (error) {
		console.log(error);

		return {
			blogs: []
		};
	}
}) satisfies PageServerLoad;
