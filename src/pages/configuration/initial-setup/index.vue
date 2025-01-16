<template>
	<div>
		<div class="py-3 px-8">
			<FmBreadcrumbs :crumbs="crumbs" />
		</div>
		<div class="px-5 py-5 flex flex-col items-start justify-start gap-2">
			<span class="mb-4 text-lg">Initial Configuration for Invited Users</span>
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
			<template v-else>
				<Card
					v-for="item in items"
					@edit="generateLink"
					@delete-item="deleteItem"
					:item="item"
					:key="item.id"
				/>
				<FmPagination
					:with-info="true"
					:total-items="count"
					:items-per-page="pageSize"
					:model-value="currentPage"
					@update:modelValue="handlePageChange"
				/>
			</template>
			<div>
				<NuxtLink
					:to="
						useGetNuxtLink('/configuration/initial-setup/new', $route.params)
					"
				>
					<FmButton type="primary" rounded> Create </FmButton>
				</NuxtLink>
			</div>
		</div>
	</div>
</template>

<script setup>
	import Card from '@/pages/configuration/initial-setup/card/index.vue';
	import {
		FmBreadcrumbs,
		FmButton,
		FmPagination,
		FmProgressCircular
	} from '@finmars/ui';
	import { useGetNuxtLink, usePrefixedRouterPush } from '~/composables/useMeta';

	definePageMeta({
		middleware: 'auth'
	});

	const route = useRoute();
	const router = useRouter();
	const crumbs = ref([{ title: 'New User Setups', path: 'initial-setup' }]);

	const loading = ref(false);
	const count = ref(0);
	const pageSize = ref(40);
	const currentPage = ref(route.query?.page ? parseInt(route.query.page) : 1);
	const items = ref([]);

	const handlePageChange = (newPage) => {
		currentPage.value = newPage;
		init(currentPage.value);
	};

	function generateLink(id) {
		usePrefixedRouterPush(router, route, `/configuration/initial-setup/${id}`);
	}

	async function getList(newPage = 1) {
		try {
			router.push({ query: { ...route.query, page: currentPage.value } });
			loading.value = true;
			const payload = {
				page_size: pageSize.value,
				page: newPage
			};
			const res = await useApi('newMemberSetupConfig.get', {
				filters: payload,
				query: { page: newPage }
			});
			count.value = res.count;
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
				await useApi('newMemberSetupConfig.delete', {
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

	function init(newPage = 1) {
		getList(newPage);
	}

	init();
</script>

<style scoped lang="scss"></style>
