<script lang="ts">
	import BlogCard from '$lib/components/blog-card.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import BlogTitles from '$lib/components/ui/blog-titles/blog-titles.svelte';
	import * as Carousel from '$lib/components/ui/carousel';
	import { Separator } from '$lib/components/ui/separator';
	import { Textarea } from '$lib/components/ui/textarea';
	import { formatdate } from '$lib/utils';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { commentFormSchema } from './schema';
	import {
		FormField,
		FormControl,
		FieldErrors,
		Button as FormButton
	} from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';

	type Props = {
		data: PageData;
	};

	const { data }: Props = $props();

	const similarBlogs = $derived(
		data.blogs.filter((blog) => blog.categoryId === data.blog.categoryId)
	);

	const addCommentForm = superForm(data.commentForm, {
		validators: zodClient(commentFormSchema)
	});

	const {
		form: commentFormData,
		enhance: commentFormEnhance,
		submitting: commentFormsubmitting
	} = addCommentForm;
</script>

<section>
	<!-- BLOG BANNER IMAGE -->
	<header class="min-h-[450px]">
		<hgroup>
			<BlogTitles
				className="font-medium text-2xl md:text-4xl tracking-wide leading-relaxed text-center mb-8 md:mb-14"
				>{data.blog.title}</BlogTitles
			>

			<div class="tags-container">
				{#each data.blog.tags as tag}
					<Badge variant="outline">
						{tag.name}
					</Badge>
				{/each}
			</div>

			<div class="author-card">
				<div>
					<!-- <Avatar.Root>
						<Avatar.Image src="/placeholder-author.png " alt="@blog9ja" />
						<Avatar.Fallback>b9ja</Avatar.Fallback>
					</Avatar.Root> -->

					<h2 class="font-medium">Author: {data.blog.author.name}</h2>
				</div>

				<p class="text-sm font-medium text-slate-500">
					Posted: {formatdate(data.blog.createdAt)} • Read Time: {Math.ceil(
						data.blogHtml.length / 800
					)} minutes
				</p>
			</div>
		</hgroup>
	</header>

	<!-- BLOG TABLE OF CONTENT & BLOG CONTENT -->

	<div class="blog-content-container">
		<!-- <aside>
			<h3>Table of Content</h3>

			<Separator />

			<ul>
				<li>
					<a href="#salary">Salary</a>
				</li>

				<li>
					<a href="#wage">New Minimun Wage</a>
				</li>

				<li>
					<a href="#wage">The State Government</a>
				</li>

				<li>
					<a href="#wage">Livelihood</a>
				</li>
			</ul>
		</aside> -->

		<div class="blog-content">
			{@html data.blogHtml}
		</div>
	</div>

	<Separator />

	<div class="comments-section">
		<h1>Comments ({data.blog.comments?.length})</h1>

		<form method="POST" action="?/addComment" use:commentFormEnhance>
			<FormField form={addCommentForm} name="comment">
				<FormControl let:attrs>
					<Textarea
						{...attrs}
						bind:value={$commentFormData.comment}
						placeholder="Write your comment..."
						class="shadow-none rounded-sm"
					/>
				</FormControl>

				<FieldErrors />
			</FormField>

			<FormButton variant="secondary" class="mr-auto">Post Comment</FormButton>

			<FormField form={addCommentForm} name="subscribersId">
				<FormControl let:attrs>
					<Input {...attrs} type="hidden" bind:value={$commentFormData.subscribersId} />
				</FormControl>

				<FieldErrors />
			</FormField>

			<FormField form={addCommentForm} name="blogId">
				<FormControl let:attrs>
					<Input {...attrs} type="hidden" bind:value={$commentFormData.blogId} />
				</FormControl>

				<FieldErrors />
			</FormField>
		</form>

		<div>
			{#if data.blog.comments && data.blog.comments.length > 0}
				{#each data.blog.comments as comment, i (i)}
					<section>
						{comment}
					</section>
				{/each}
			{:else}
				<section>
					<p>There are no comments yet !!</p>
				</section>
			{/if}
		</div>
	</div>

	<!-- SIMILAR ARTICLES -->

	<div class="similar-blogs-section">
		<BlogTitles>Similar Articles</BlogTitles>

		<Carousel.Root
			opts={{
				align: 'start'
			}}
			class="w-3/4 sm:w-5/6 xl:w-full h-max"
		>
			<Carousel.Content class="gap-4 h-max">
				{#each similarBlogs as blog, i}
					<Carousel.Item class="sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
						<div class="p-1 h-full">
							<BlogCard className="w-[263px] min-w-[253px] h-full" {blog} />
						</div>
					</Carousel.Item>
				{/each}
			</Carousel.Content>
			<Carousel.Previous />
			<Carousel.Next />
		</Carousel.Root>
	</div>
</section>

<style lang="postcss">
	section {
		@apply flex flex-col gap-10;
	}

	header {
		@apply flex items-center justify-center p-5 bg-green-100/20;

		p {
			@apply text-center;
		}

		.tags-container {
			@apply flex items-center justify-center max-w-md flex-wrap gap-3 mx-auto;
		}
	}

	.author-card {
		@apply flex items-center flex-col justify-center;
	}

	.author-card > div {
		@apply flex items-center gap-1 mb-2;
	}

	.blog-content-container {
		@apply flex flex-col sm:flex-row gap-5 lg:gap-10 w-full;
	}

	/* .blog-content-container > aside {
		@apply w-full sm:w-1/4 lg:w-1/5 flex flex-col gap-4 p-2;
	}

	.blog-content-container > aside h3 {
		@apply font-medium text-lg;
		font-family: 'Open Sans', sans-serif;
	}

	.blog-content-container > aside ul {
		@apply flex flex-col gap-1;
	}

	.blog-content-container > aside ul a {
		@apply font-normal text-sm text-slate-600 tracking-wide;
	} */

	.comments-section {
		@apply flex flex-col gap-2;

		> h1 {
			@apply text-xl font-medium;
		}

		section {
			@apply mt-3;
		}

		form {
			@apply flex flex-col gap-3;
		}
	}

	.similar-blogs-section {
		@apply mt-10 flex flex-col gap-4  w-full max-w-full items-center;
	}
</style>
