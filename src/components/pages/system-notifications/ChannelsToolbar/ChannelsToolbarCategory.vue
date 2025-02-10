<template>
	<FmMenu
		v-model="isMenuOpen"
		:items="notificationCategories"
		width="260"
		:close-on-content-click="false"
		scroll-strategy="block"
	>
		<template #activator="{ props }">
			<FmButton
				v-bind="props"
				type="secondary"
				rounded
				append-icon="mdi-menu-down"
			>
				{{ selectedCategory }}

				<FmTooltip
					activator="parent"
					type="secondary"
					location="top"
					:disabled="size(categoriesFilterValue) < 2"
				>
					{{ categoriesFilterValue.join(', ') }}
				</FmTooltip>
			</FmButton>
		</template>

		<template #item="{ item }">
			<div class="category-item" @click.stop.prevent="selectItem(item)">
				<FmCheckbox
					v-if="item.user_code"
					:model-value="
						categoriesFilterValue.includes(item.user_code)
					"
				/>

				<span class="category-item__name">
					{{ item.name }}
				</span>
			</div>
		</template>
	</FmMenu>
</template>

<script setup>
	import { computed, ref, watch } from 'vue';
	import { storeToRefs } from 'pinia';
	import size from 'lodash/size';
	import cloneDeep from 'lodash/cloneDeep';
	import { FmButton, FmMenu, FmCheckbox, FmTooltip } from '@finmars/ui';
	import { useNotificationsStore } from '~/stores/useNotificationsStore';

	const notificationsStore = useNotificationsStore();
	const { categories, notificationsFilter } = storeToRefs(notificationsStore);
	const { setNotificationsFilter } = notificationsStore;

	const isMenuOpen = ref(false);
	const categoriesFilterValue = ref([]);

	const notificationCategories = computed(() => [
		{ user_code: '', name: 'All categories' },
		...categories.value
	]);

	const categoryFilter = computed(() => notificationsFilter.value.category);

	const selectedCategory = computed(() => {
		if (size(categoriesFilterValue.value) === 0) {
			return 'All categories';
		}

		const val = notificationCategories.value
			.filter((c) => categoriesFilterValue.value.includes(c.user_code))
			.map((c) => c.name);
		return size(val) === 1
			? `Category: ${val[0]}`
			: `Categories: ${val[0]} (+ ${size(val) - 1})`;
	});

	function selectItem(item) {
		if (!item.user_code) {
			categoriesFilterValue.value = [];
			updateFilter([]);
			isMenuOpen.value = false;
			return;
		}

		const index = categoriesFilterValue.value.findIndex(
			(v) => v === item.user_code
		);
		if (index === -1) {
			categoriesFilterValue.value.push(item.user_code);
		} else {
			categoriesFilterValue.value.splice(index, 1);
		}
	}

	function updateFilter(val) {
		setNotificationsFilter({ category: val });
	}

	watch(
		() => isMenuOpen.value,
		(val, oVal) => {
			if (val !== oVal && !val) {
				updateFilter(categoriesFilterValue.value);
			}
		}
	);

	watch(
		() => categoryFilter.value,
		() => {
			if (
				JSON.stringify(categoryFilter.value) ===
				JSON.stringify(categoriesFilterValue.value)
			) {
				categoriesFilterValue.value = cloneDeep(categoryFilter.value);
			}
		},
		{ immediate: true }
	);
</script>

<style lang="scss">
	.v-overlay-container {
		.v-overlay.v-menu {
			div.v-overlay__content {
				border-radius: 4px !important;

				& > div {
					border-radius: 4px !important;
					padding: 8px 0 !important;
				}
			}
		}
	}
</style>

<style lang="scss" scoped>
	.category-item {
		position: relative;
		width: 100%;
		height: 56px;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		overflow: hidden;
		font-size: var(--body-large-font);
		color: var(--on-surface);
		column-gap: 8px;

		&__name {
			flex-grow: 1;
		}
	}
</style>
