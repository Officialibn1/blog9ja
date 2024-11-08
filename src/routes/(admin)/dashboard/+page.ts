import { validateUsers, type User } from '$lib/utils';
import type { PageLoad } from './$types';

export const ssr = false;

export const load = (async ({ fetch }) => {
	const fetchUsers = async () => {
		const response = await fetch(
			`https://dummyjson.com/users?limit=15&select=firstName,lastName,weight,height,age`
		);

		const { users } = await response.json();

		if (!Array.isArray(users)) {
			return [];
		}

		const validatedUsers: User[] = [];

		for (const user of users) {
			if (!validateUsers(user)) {
				break;
			}

			validatedUsers.push(user);
		}

		return validatedUsers;
	};

	return {
		users: fetchUsers
	};
}) satisfies PageLoad;
