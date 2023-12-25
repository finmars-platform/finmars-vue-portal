<template>
	<div v-bind="$attrs">
		<BaseInput
			:modelValue="inputTextC"
			:label="label"
			baseInputType="button"
			@click="modalOpened = true"
		/>
	</div>

	<FmDateTreeModal
		v-model="modalOpened"
		:datesTree="datesTree"
		:options="options"
		:title="label || 'Select dates'"
		@save="newVal => emit('update:datesTree', newVal)"
	/>
</template>

<script setup>

// stores
// props, emits
let props = defineProps({
	/* *
	 * @type [{
	 *
	 * 	items: [{	- months
	 *
	 * 		items: [{	- days
	 *			active: Boolean,
	 * 			value: String,	- 'YYYY-MM-DD'
	 * 		}]
	 *
	 * 		active: Boolean,
	 * 		name: String,
	 * 		number: Number,
	 * 		showDays: Boolean,
	 * 		someChildrenActive: Boolean,
	 * 	]}
	 *
	 * 	active: Boolean,
	 * 	showMonths: Boolean,
	 * 	someChildrenActive: Boolean,
	 * 	yearNumber: Number,
	 * }]
	 * */
	datesTree: {
		type: Array,
		default() {
			return [];
		},
	},
	label: String,
	placeholder: String,
	/** List of dates available for selection */
	options: {
		type: Array,
		default() { return [] },
	},
});
console.log("testing1923.DateTreeInput props.modelValue", props.datesTree);
let emit = defineEmits(['update:datesTree']);

//# region variables, refs, computed

let modalOpened = ref(false);

let inputTextC = computed(() => {

	let datesSelected = 0;

	props.datesTree.forEach(function (yearGroup) {

		yearGroup.items.forEach(function (monthGroup) {

			monthGroup.items.forEach(function (day) {

				if (day.active) {
					datesSelected = datesSelected + 1;
				}

			});

		});

	});
	console.log("testing1923.DatesTreeInput datesSelected", datesSelected);
	return datesSelected ? `${datesSelected} dates selected` : '';

})
//# endregion

//# region hooks
//# endregion

// watchers
</script>

<style scoped lang="scss">

</style>
