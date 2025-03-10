<template>
	<!-- <button> instead of <div> because of 'disabled' attribute -->
	<button class="t_cell" :class="cellClasses">
		<slot />

		<FmBtn
			v-if="sorting || sorting === ''"
			type="icon"
			class="sorting_icon_btn"
			:class="{ active: ['asc', 'desc'].includes(sorting) }"
			:disabled="sortingDisabled"
			@click="emits('toggleSorting')"
		>
			<FmIcon
				class="sorting_icon"
				:icon="sorting === 'asc' ? 'arrow_downward' : 'arrow_upward'"
				size="15"
				:disabled="sortingDisabled"
			/>
		</FmBtn>

		<FmLoader v-if="loading" />
	</button>
</template>

<script setup>
	/*
	 * Supporting component for the
	 * components/Fm/BasicTable/index.vue, components/Fm/BasicTable/Header.vue .
	 * Must always have one of them as parent.
	 */

	// stores
	// props, emits
	let props = defineProps({
		loading: Boolean,
		/** @values: 'number' */
		valueType: Number,
		readonly: Boolean,
		/**
		 * Empty string used when sorting enabled for the cell but not active
		 *
		 * @values: 'asc', 'desc', '', undefined
		 */
		sorting: String,
		sortingDisabled: Boolean,
		empty: Boolean // used to mark cells that contain: null, undefined, ''
	});

	if (props.valueType && ![20].includes(props.valueType)) {
		throw `FmBasicTable: invalid value passed to property 'valueType': ${props.valueType}`;
	}

	let emits = defineEmits('toggleSorting');
	//# region variables, refs, computed
	const valueTypeNames = {
		20: 'number'
	};

	let cellClasses = computed(() => {
		let classes = {
			readonly: props.readonly,
			empty: props.empty
		};

		if (props.valueType) {
			// e.g. 'number-cell'
			const className = valueTypeNames[props.valueType] + '-cell';

			classes[className] = true;
		}

		return classes;
	});
	//# endregion

	//# region hooks
	//# endregion

	// watchers
</script>

<style scoped lang="scss">
	$main-darken: #f2f1f1;
	/*
	 * Some styles are applied to this component inside components
	 * FmBasicTable and FmBasicTableHeader using :deep()
	 */

	.t_cell {
		position: relative;
		display: block;
		// height: calc(100% - 1px); // without -1px
		height: inherit;
		padding: 0 16px;
		text-align: inherit; // from FmBasicTableRow
		cursor: inherit;

		&:not(.no_collapsed) {
			overflow: hidden;

			.table-cell-btn {
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		& + & {
			border-left: 1px solid var(--table-border-color);
		}

		&.empty {
			background-color: $main-darken;
		}

		&[disabled] {
			// background-color: $main-darken-2;
			color: rgba(var(--secondary-color), var(--disabled-opacity));
			cursor: default;
		}

		&:not([disabled]):hover {
			:deep(.fm_btn.sorting_icon_btn) {
				display: block;
			}
		}
	}

	.t_cell.number-cell {
		text-align: right;
	}

	:deep(.fm_btn.sorting_icon_btn) {
		// 2 classes needed to override classes inside FmBtn
		position: absolute;
		right: 2px;

		top: 50%;
		transform: translateY(-50%);

		&:not(.active) {
			display: none;
		}
	}

	:deep(.sorting_icon) {
		padding: 4px;
		font-weight: 700;
	}
</style>
