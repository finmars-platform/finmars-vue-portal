<template>
	<div class="table">
		<div class="table-row t_header" :style="{gridTemplateColumns: colls}">
			<div
				class="table-cell font-weight-bold"
				v-for="(header, index) in headers"
				:key="index"
			>
				{{ header }}
			</div>
		</div>

		<div class="table-row"
			:style="{gridTemplateColumns: colls}"
			v-for="(row, index) in items"
			:key="index"
		>
			<div
				class="table-cell"
				v-for="(item, index) in row"
				:key="index"
			>
				{{ item }}
			</div>
		</div>
	</div>
</template>

<script setup>

	let props = defineProps({
		headers: {
			type: Array
		},
		items: {
			type: Array
		},
		colls: {
			type: String
		}
	})
</script>

<style lang="scss" scoped>
.table {
	border: 1px solid $border;
	width: 100%;
	font-size: 14px;
}
.table-row {
	display: grid;
	align-items: center;
	background: #Fff;
	height: 36px;
	border-bottom: 1px solid $border;
	line-height: 36px;
	&.t_header {
		background: #F2F2F2;
		height: 50px;
		line-height: 50px;
		font-weight: 500;
	}
}
.table-cell {
	white-space: nowrap;
	padding: 0 14px;
	height: inherit;
	line-height: inherit;

	& + & {
		border-left: 1px solid $border;
	}
}
</style>
