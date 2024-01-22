<template>
	<div class="table">
		<div class="table-row t_header" :style="{ gridTemplateColumns: colls }">
			<div v-if="isActions">
				<FmCheckbox/>
			</div>
			<div v-if="isActions" class="table-cell"></div>
			<div
				class="table-cell font-weight-bold"
				v-for="(header, index) in headers"
				:key="index"
			>
				{{ header }}
			</div>
		</div>

		<div
			class="table-row"
			:class="{ active: active == index, choosible: active !== undefined }"
			:style="{ gridTemplateColumns: colls }"
			v-for="(row, index) in items"
			:key="index"
		>
			<div class="center" v-if="isActions">
				<FmCheckbox/>
			</div>

			<div class="table-cell no_collapsed" v-if="$slots.actions">
				<slot name="actions" :index="index"/>
			</div>
			<div
				class="table-cell"
				v-for="(item, indexRow) in row"
				:key="indexRow"
				@click="
					() => {
						if (cb) cb(index, indexRow)
					}
				"
				@click.right="
					() => {
						if (rightClickCallback) rightClickCallback(index, indexRow)
					}
				"
			>
				<FmLoader v-if="item === null"/>

				<template v-else-if="typeof item == 'object'">

					<div
						class="overflow-hidden text-overflow-ellipsis"
						v-fm-tooltip="item.value"
					>
						<NuxtLink
							v-if="item.link"
							class="link dib"
							:to="item.link"

						>{{ item.value }}
						</NuxtLink>

						<template v-else>{{ item.value }}</template>
					</div>

				</template>

				<template v-else>
					<div
						class="overflow-hidden text-overflow-ellipsis"
						v-fm-tooltip="item"
					>{{ item === '' ? '-' : item }}
					</div>
				</template>
			</div>
		</div>
	</div>
	<div class="center p-16" v-if="status === 'loading'">
		<FmLoader/>
	</div>
</template>

<script setup>
let props = defineProps({
	headers: {
		type: Array,
	},
	items: {
		type: Array,
	},
	colls: {
		type: String,
	},
	cb: {
		type: Function,
	},
	rightClickCallback: {
		type: Function,
	},
	status: {
		// done, loading, fail
		type: String,
		default: 'done',
	},
	active: {
		type: Number,
	},
	isActions: {
		type: Boolean,
	},
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
	background: #fff;
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
		background: #f2f2f2;
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

	&:not(.no_collapsed) {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	& + & {
		border-left: 1px solid $border;
	}

	&.disabled {
		background: $main-darken-2;
	}
}

.link {
	text-decoration: underline;
}
</style>
