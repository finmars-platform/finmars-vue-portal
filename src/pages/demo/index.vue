<template>
	<div class="demo-page">
		<h1>Components</h1>
		<ul class="list">
			<li>
				<NuxtLink :to="useGetNuxtLink('/demo/breadcrumbs', $route.params)">
					Breadcrumbs
				</NuxtLink>
			</li>
			<li>
				<NuxtLink :to="useGetNuxtLink('/demo/button', $route.params)">
					Buttons
				</NuxtLink>
			</li>
			<li>
				<NuxtLink :to="useGetNuxtLink('/demo/card', $route.params)">
					Card
				</NuxtLink>
			</li>
			<li>
				<NuxtLink :to="useGetNuxtLink('/demo/checkbox', $route.params)">
					Checkbox
				</NuxtLink>
			</li>
			<li>
				<NuxtLink :to="useGetNuxtLink('/demo/chips', $route.params)">
					Chips
				</NuxtLink>
			</li>
			<li>
				<NuxtLink :to="useGetNuxtLink('/demo/button', $route.params)">
					Confirm
				</NuxtLink>
			</li>
			<li>
				<NuxtLink :to="useGetNuxtLink('/demo/copyButton', $route.params)">
					CopyButton
				</NuxtLink>
			</li>
			<li>
				<NuxtLink :to="useGetNuxtLink('/demo/extension-panel', $route.params)">
					ExpansionPanel
				</NuxtLink>
			</li>
		</ul>
	</div>
</template>

<script setup>
	import { useGetNuxtLink } from '~/composables/useMeta'
</script>

<style scoped lang="scss">
	.demo-page {
	}

	.list {
		border: 1px solid var(--baseText-color);
		padding: 24px;
	}

	li {
		margin-bottom: 16px;
	}
</style>
