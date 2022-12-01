<template>
	<div class="drag_container">
		<div class="shadow_grid"
			v-if="isEdit"
		>
			<div class="shadow_grid_item"
				v-for="(item, key) in shadowCells"
				:key="key"
			></div>
		</div>

		<div class="drag_zone grid" ref="gridElement">
			<slot />
		</div>

		<FmBtn
			v-if="isEdit"
			class="add_component flex aic jcc"
			@click="isOpenAddComponents = true"
			icon="add"
		>
			Add components
		</FmBtn>

		<PagesDashboardAddComponentM
			v-if="isOpenAddComponents"
			v-model="isOpenAddComponents"
			:tab="tab"
			@close="isOpenAddComponents = false"
		/>
	</div>
</template>

<script setup>
	let props = defineProps({
		isEdit: {
			type: Boolean,
			required: true
		},
		tab: String,
	})

	let isOpenAddComponents = ref(false)

	let gridElement = ref(null)
	let shadowCells = ref([])

	onMounted(() => {
		const resizeObserver = new ResizeObserver((entries) => {
			let rowsCount = Math.ceil(entries[0].contentRect.height / (50 + 20))

			shadowCells.value = new Array(rowsCount * 12)
		})

		resizeObserver.observe(gridElement.value)
	})
</script>

<style lang="scss" scoped>
	.drag_container {
		position: relative;
		margin: 20px 30px;
	}
	.grid {
		display: grid;
		gap: 20px;
		grid-template-columns: repeat(12, 1fr);
		grid-auto-rows: 50px;
	}
	.shadow_grid {
		position: absolute;
		display: grid;
		width: 100%;
		gap: 20px;
		grid-template-columns: repeat(12, 1fr);
		grid-auto-rows: 50px;
		z-index: 0;

		&_item {
			border: 1px solid #ecded2;
			background: $primary-lighten-2;
			border-radius: 4px;
		}
	}
	.add_component {
		width: 100%;
		margin-top: 20px;
		background: #f9f4f1 !important;
		border: 1px solid #ecded2;
		height: 50px;
		color: #7d7d7d !important;

		&:hover {
			background: #ecded2 !important;
		}
	}
</style>
