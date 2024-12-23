<template>
	<div>
		<div class="py-3 px-8">
			<FmBreadcrumbs :crumbs="crumbs" />
		</div>
		<div class="px-5 py-5 flex flex-col items-start justify-start gap-2">
			<span class="mb-4 text-lg">Initial Configuration for Invited Users</span>
			<div>
				<NuxtLink
					:class="{ disabledNuxtLink: items.length > 2 }"
					:to="
						useGetNuxtLink(
							'/configuration/context-menu-layouts/new',
							$route.params
						)
					"
				>
					<FmButton type="primary" :disabled="items.length > 2" rounded>
						Add New Layout
					</FmButton>
				</NuxtLink>
			</div>
			<div
				v-if="loading"
				class="flex w-full justify-center items-center min-h-36"
			>
				<FmProgressCircular :size="32" indeterminate />
			</div>
			<div
				v-else-if="!items.length"
				class="flex w-full justify-center items-center min-w-36"
			>
				<span>No data available!</span>
			</div>
			<div v-else class="flex flex-col py-4 w-full gap-3">
				<Card
					v-for="item in items"
					@edit="generateLink"
					@delete="deleteItem"
					:item="item"
					:key="item.id"
				/>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { FmBreadcrumbs, FmButton, FmProgressCircular } from '@finmars/ui';
	import { useGetNuxtLink, usePrefixedRouterPush } from '~/composables/useMeta';
	import Card from '~/pages/configuration/context-menu-layouts/card/index.vue';

	definePageMeta({
		middleware: 'auth'
	});

	const route = useRoute();
	const router = useRouter();
	const crumbs = ref([
		{ title: 'Context Menu Layouts', path: 'context-menu-layouts' }
	]);
	const loading = ref(false);
	const items = ref([]);

	function generateLink(id) {
		usePrefixedRouterPush(
			router,
			route,
			`/configuration/context-menu-layouts/${id}`
		);
	}

	async function getList() {
		try {
			loading.value = true;
			const res = await useApi('contextMenuLayoutList.get');
			items.value = res.results;
		} catch (e) {
			console.log(`Catch error: ${e}`);
		} finally {
			loading.value = false;
		}
	}

	async function deleteItem(item) {
		const confirm = await useConfirm({
			title: 'Warning',
			text: `Are you sure that you want to delete ${item.name}?`
		});
		if (confirm) {
			try {
				await useApi('contextMenuLayoutList.delete', {
					params: { id: item.id }
				});
				useNotify({
					type: 'success',
					title: `${item.name} successfully deleted`
				});
				await getList();
			} catch (e) {
				console.log(`Catch error: ${e}`);
			}
		}
	}

	function init() {
		getList();
	}

	init();
</script>

<style scoped lang="scss">
	.disabledNuxtLink {
		cursor: none;
		pointer-events: none;
	}
</style>
