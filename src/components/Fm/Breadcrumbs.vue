<template>
	<div class="fm_breadcrumbs">
		<template v-for="(item, index) in items" :key="index">
			<NuxtLink
				v-if="!item.disabled"
				class="fm_breadcrumbs_items"
				:to="item.to"
			>
				{{ item.text }}
			</NuxtLink>
			<div v-else>{{ item.text }}</div>

			<FmIcon
				v-if="last != index"
				class="fm_breadcrumbs_devider"
				icon="east"
			/>
		</template>
	</div>
</template>

<script setup>
	let props = defineProps({
		items: Array
	});

	let last = ref(0);

	if (props.items) setLast();

	watch(
		() => props.items,
		() => setLast()
	);

	function setLast() {
		if (props.items?.length) last.value = props.items.length - 1;
	}
</script>

<style lang="scss" scoped>
	.fm_breadcrumbs {
		display: flex;
		align-items: center;
	}

	.fm_breadcrumbs_items {
		border-bottom: 1px solid #333;
		padding-bottom: 1px;
		transition: 0.3s;
		color: var(--card-secondary-text-color);
		border-color: var(--card-secondary-text-color);

		&:hover {
			color: var(--secondary-color);
			border-color: var(--secondary-color);
		}
	}

	.fm_breadcrumbs_devider {
		padding: 0 12px;
		font-size: 18px;
		cursor: default;
	}
</style>
