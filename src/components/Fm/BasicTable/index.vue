<template>
	<div
		class="table1"
		:class="{
			readonly: isReadonly,
			selectable_rows: selectableRows,
			[type]: type
		}"
	>
		<div v-if="$slots.header" class="t_head">
			<slot name="header" />
		</div>

		<div class="t_body">
			<!-- Default slot that contains table rows -->
			<slot />

			<div v-if="props.loading" class="center p-16">
				<FmLoader />
			</div>
		</div>
	</div>
</template>

<script setup>
	/* *
	 * Used instead of BaseTable
	 * */

	// stores
	// props, emits
	let props = defineProps({
		loading: Boolean,
		/** highlightedEdges */
		type: String,
		selectableRows: Boolean
	});

	//# region variables, refs, computed

	//# endregion

	//# region hooks
	//# endregion

	// watchers
</script>

<style scoped lang="scss">
	$hover-background2: #fac87863;

	.table1 {
		border-top: var(--base-border);
		border-right: var(--base-border);
		border-left: var(--base-border);
		width: 100%;
		font-size: 14px;
		text-align: left;

		&:not(.disabled) {
			.t_head {
				:deep(.t_row) {
					height: 49px;
					font-weight: 500;

					&:not(.disabled):hover {
						background-color: initial;
					}
				}
			}
		}
	}

	.t_head {
		background-color: var(--tableHeader-backgroundColor);
	}

	.table1.highlightedEdges {
		.t_head {
			:deep(.t_cell) {
				&:first-child,
				&:last-child {
					font-weight: 600;
				}
			}
		}

		:deep(.t_row:not(.active)) {
			.t_cell {
				&:first-child,
				&:last-child {
					background-color: var(--tableHeader-backgroundColor);
				}
			}
		}
	}

	.table1.selectable_rows {
		.t_body {
			:deep(.t_row) {
				&:not([disabled]) {
					cursor: pointer;

					&:not(.active):hover {
						background-color: $hover-background2;

						.t_cell:not([disabled]) {
							background-color: initial;
						}
					}
				}
			}
		}
	}
</style>
