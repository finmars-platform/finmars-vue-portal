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
			:class="{ active: active == index, choosible: active !== undefined }"
			:style="{gridTemplateColumns: colls}"
			v-for="(row, index) in items"
			:key="index"
			@click="() => {if (cb) cb(index)}"
		>
			<div
				class="table-cell"
				:class="{disabled: item === ''}"
				v-for="(item, index) in row"
				:key="index"
			>
				<FmLoader v-if="item === null" />
				<template v-else>{{ item }}</template>
			</div>
		</div>
	</div>
	<div class="center p-16" v-if="!items.length">
		<FmLoader />
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
		},
		cb: {
			type: Function
		},
		status: { // done, loading, fail
			type: String
		},
		active: {
			type: Number
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
	transition: outline 0.1s;
	outline: solid transparent;
	&.choosible {
		cursor: pointer;

		&:not(.active):hover {
			background: #fac87863;
		}
	}
	&.active {
		background: #fac87863;
	}
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
	&.disabled {
		background: $main-darken-2;
	}
}
</style>
