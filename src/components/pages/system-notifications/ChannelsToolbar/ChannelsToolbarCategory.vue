<template>
	<FmMenu width="260">
		<template #activator="{ props }">
			<FmButton
				v-bind="props"
				type="secondary"
				rounded
				append-icon="mdi-menu-down"
			>
				{{ selectedCategory }}
			</FmButton>
		</template>

		<FmMenuItem
			v-for="cat in notificationCategories"
			:key="cat.user_code"
			item-size="large"
			:title="cat.name"
			:item-selected="cat.user_code === categoryFilter"
			@click="updateFilter(cat.user_code)"
		/>
	</FmMenu>
</template>

<script setup>
	import { computed } from 'vue';
	import { storeToRefs } from 'pinia';
	import { FmButton, FmMenu, FmMenuItem } from '@finmars/ui';
	import useNotificationsStore from '~/stores/useNotificationsStore';

	const notificationsStore = useNotificationsStore();
	const { categories, notificationsFilter } = storeToRefs(notificationsStore);
	const { setNotificationsFilter } = notificationsStore;

	const notificationCategories = computed(() => [
		{ user_code: '', name: 'All categories' },
		...categories.value
	]);

	const categoryFilter = computed(() => notificationsFilter.value.category);

	const selectedCategory = computed(() => {
		const cat = notificationCategories.value.find(
			(c) => c.user_code === categoryFilter.value
		);

		if (cat) {
			return cat.user_code ? `Category: ${cat.name}` : cat.name;
		}

		return '';
	});

	function updateFilter(val) {
		setNotificationsFilter({ category: val });
	}
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
