<script>
	import BlogCard from '$lib/components/blog-card.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { RadioGroup } from '$lib/components/ui/radio-group';
	import RadioGroupItem from '$lib/components/ui/radio-group/radio-group-item.svelte';

	const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
</script>

<section>
	<aside>
		<h1>Filters</h1>

		<div class="filter-group">
			<h2>Categories</h2>

			<div class="flex gap-2">
				<Label for="news">News</Label>
				<Checkbox id="news" value="news" />
			</div>

			<div class="flex gap-2">
				<Label for="sports">Sports</Label>
				<Checkbox id="sports" value="sports" />
			</div>

			<div class="flex gap-2">
				<Label for="entertainment">Entertainment</Label>
				<Checkbox id="news" value="news" />
			</div>

			<div class="flex gap-2">
				<Label for="jists">Jist's</Label>
				<Checkbox id="jists" value="jists" />
			</div>

			<div class="flex gap-2">
				<Label for="music">Music</Label>
				<Checkbox id="music" value="music" />
			</div>

			<div class="flex gap-2">
				<Label for="fashion">Fashion</Label>
				<Checkbox id="fashion" value="fashion" />
			</div>
		</div>

		<div class="filter-group">
			<h2>Order By</h2>

			<RadioGroup>
				<div class="flex gap-2">
					<Label for="newest">Newest</Label>
					<RadioGroupItem id="newest" value="newest" />
				</div>

				<div class="flex gap-2">
					<Label for="old">Old</Label>
					<RadioGroupItem id="old" value="old" />
				</div>

				<div class="flex gap-2">
					<Label for="trending">Trending</Label>
					<RadioGroupItem id="trending" value="trending" />
				</div>
			</RadioGroup>
		</div>
	</aside>

	<div class="main-content">
		<header>
			<form>
				<Input />
				<!-- class="bg-green-600 hover:bg-green-600/80" -->
				<Button variant="outline">Search</Button>
			</form>
		</header>

		<div class="cards-wrapper">
			{#each nums as num, i}
				<BlogCard id={num * i} />
			{/each}
		</div>
	</div>
</section>

<style lang="postcss">
	section {
		@apply flex gap-10 w-full mt-10 lg:mt-20;
	}

	aside {
		@apply hidden md:flex flex-col gap-10 w-1/5;
	}

	aside > h1 {
		@apply text-2xl font-semibold;
	}

	.filter-group {
		@apply flex flex-col gap-3;
	}

	.filter-group > h2 {
		@apply text-lg font-medium;
	}

	.filter-group div {
		@apply flex flex-row-reverse gap-2 justify-end items-center w-full;
	}

	.main-content {
		@apply flex flex-col w-full gap-10;
	}

	header {
		@apply w-full flex;
	}

	header > form {
		@apply flex w-full  items-center gap-5;
	}

	header > form > input {
		@apply flex-1;
	}

	.cards-wrapper {
		@apply grid gap-5 md:grid-cols-2 lg:grid-cols-3;
	}
</style>
