<template>
	<div class="px-5 py-5 flex flex-col items-start justify-start gap-2">
		<div class="pb-3">
			<FmBreadcrumbs :crumbs="crumbs" />
		</div>
		<span class="mb-4 text-lg">Initial Configuration for Invited Users</span>
		<div class="flex flex-col gap-5 justify-start items-start">
			<FmButton type="secondary" rounded>Select from List</FmButton>
			<NuxtLink
				:class="{ disabledNuxtLink: items.length > 2 }"
				:to="
					useGetNuxtLink(
						'/configuration/context-menu-layouts/add',
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
			class="flex w-full justify-center items-center min-w-36"
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
			<Card :items="items" @edit="generateLink" @delete="deleteItem" />
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
