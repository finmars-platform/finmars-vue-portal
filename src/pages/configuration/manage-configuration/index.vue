<template>
	<section class="manage-configuration">
		<div class="row">
			<h1 class="text-[20px] font-bold">Manage Configuration</h1>
			<FmIconButton
				size="small"
				class="refresh"
				icon="mdi-refresh"
				:disabled="isLoading"
				@click="refresh"
			>
				<FmTooltip activator="parent" type="secondary" location="top">
					Refresh
				</FmTooltip>
			</FmIconButton>

			<FmButton @click="onOpenNew" rounded class="button">
				Add new Configuration
			</FmButton>
		</div>
		<FmTextField
			outlined
			hide-details
			clearable
			label="Search"
			placeholder="Enter configuration name"
			:disabled="isLoading"
			:model-value="filters.query"
			@update:model-value="setFiltersDebounced"
			class="search"
		/>
		<div class="list">
			<ManageConfigurationItem
				v-for="item in items"
				:key="item.id"
				:name="item.name"
				:itemId="item.id"
				:code="item.configuration_code"
				:version="item.version"
				:isFromMarketplace="item.is_from_marketplace"
				:isPrimary="item.is_primary"
				class="item"
			/>
			<div
				v-if="isLoading"
				class="absolute left-0 top-0 w-full h-full flex justify-center items-center bg-[var(--tasks-loading-bg)]"
			>
				<FmProgressCircular indeterminate />
			</div>
		</div>
		<FmPagination
			v-model="filters.page"
			:disabled="isLoading"
			:items-per-page="filters.page_size"
			:total-items="total"
			@update:model-value="setFilters({ page: $event })"
		/>
	</section>
</template>

<script setup>
	import { ref } from 'vue';
	import ManageConfigurationItem from '~/pages/configuration/manage-configuration/_components/ManageConfigurationItem.vue';
	import {
		FmButton,
		FmIconButton,
		FmPagination,
		FmProgressCircular,
		FmTextField,
		FmTooltip
	} from '@finmars/ui';
	import useApi from '@/composables/useApi';
	import { debounce } from 'lodash';
	import { useGetNuxtLink } from '~/composables/useMeta';

	definePageMeta({
		middleware: 'auth'
	});

	const route = useRoute();
	const router = useRouter();

	const isLoading = ref(false);
	const total = ref(0);
	const filters = ref({
		page: 1,
		query: null,
		page_size: 20
	});
	const items = ref([]);

	async function refresh() {
		await getConfigurationList();
	}

	async function getConfigurationList() {
		try {
			isLoading.value = true;
			const { query, page, page_size } = filters.value;

			const data = await useApi('configurationList.get', {
				filters: {
					...(query && { query }),
					page,
					page_size,
					ordering: 'name'
				}
			});

			items.value = data?.results || [];
			total.value = data?.count || 0;
		} catch (e) {
			console.warn('CONFIGURATION LIST LOADING ERROR. ', e);
		} finally {
			isLoading.value = false;
		}
	}

	async function setFilters(value) {
		filters.value = {
			...filters.value,
			...value
		};

		await getConfigurationList();
	}

	const setFiltersDebounced = debounce(async (value) => {
		await setFilters({ query: value, page: 1 });
	}, 700);

	function onOpenNew() {
		router.push(
			useGetNuxtLink(`/configuration/manage-configuration/new`, route.params)
		);
	}

	getConfigurationList();
</script>

<style lang="scss" scoped>
	.manage-configuration {
		font-size: 14px;
		padding: 8px;
		color: var(--on-surface);
	}

	.row {
		display: flex;
		align-items: center;
		gap: 16px;

		margin-bottom: 8px;
	}

	.list {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;

		margin-top: 16px;
		margin-bottom: 16px;
	}

	.search {
		max-width: 256px;
	}

	.button {
		margin-left: auto;
	}
</style>
