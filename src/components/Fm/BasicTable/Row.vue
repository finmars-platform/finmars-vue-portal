<template>
	<!-- <button> instead of <div> because of 'disabled' attribute -->
	<button class="t_row" :class="{ active: active }" :disabled="disabled">
		<slot />
	</button>
</template>

<script setup>
	/* eslint-disable */
	/*
	 * Supporting component for the
	 * components/Fm/BasicTable/index.vue, components/Fm/BasicTable/Header.vue .
	 * Must always have one of them as parent.
	 */

	// stores
	// props, emits
	let props = defineProps({
		active: Boolean,
		disabled: Boolean
	});

	//# region variables, refs, computed

	//# endregion

	//# region hooks
	//# endregion

	// watchers
</script>

<style scoped lang="scss">
	/*
	 * Some styles are applied inside FmBasicTable and FmBasicTableHeader
	 * using :deep()
	 */

	.t_row {
		display: flex;
		height: 35px;
		outline: solid transparent;
		transition: outline 0.1s;
		border-bottom: var(--base-border);
		text-align: inherit; // from FmBasicTable

		// without content-box FmBasicTableCell overlaps border of FmBasicTableRow
		box-sizing: content-box;

		&.grid {
			display: grid;
		}

		/*&:not(.disabled) {
			cursor: pointer;

			&:not(.active):hover {
				background: $hover-background2;

				:deep(.t_cell) {
					background: $hover-background2;
				}
			}
		}*/

		&:not([disabled]).active {
			background: #fac87863;
		}
	}
</style>
