<template>
	<!--
	modelValue passed inside BaseInput
	to apply styles for filled input
	e.g. class 'filled'
	-->
	<BaseInput
		class="ms_wrap input_btn cursor-pointer"
		:label="title"
		v-bind="$attrs"
		:disabled="disabled"
		@click.stop="openDialog"
		:modelValue="Array.isArray(modelValue) ? modelValue.join() : modelValue"
	>
		<template #button><FmIcon icon="menu" /></template>

<!--		<div v-if="multiselect" class="flex aic" style="height: inherit;">

			<div
				class="flex-row fi-center"
				v-for="item in modelValue"
				:key="item.key"
			>
				<FmIcon
					v-if="item.error_data"
					error
					icon="info"
					size="16"
					class="m-r-8"
					style="height: 16px;"
				/>
				<span>{{ item.name }}</span>
			</div>

		</div>-->
		<div class="fm_select_main_input">

			<div
				class="selected_text"
				:class="{'nothing_selected': !modelValue || (Array.isArray(modelValue) && !modelValue.length) }"
				v-fm-tooltip="selectedName"
			>
				{{ selectedName }}
			</div>

		</div>
	</BaseInput>

	<FmAttributesSelectModal
		v-model="modalIsOpen"
		:title="title"
		:contentType="contentType"
		:valueType="valueType"
		:attributes="attributesList"
		:selected="modelValue"
		:multiselect="multiselect"
		@save="selected => emit('update:modelValue', selected)"
		@selectedAttributesChanged="selected => emit('selectedAttributesChanged', selected)"
	/>

</template>

<script setup>

	let props = defineProps({
		modelValue: [Array, String], // Array of Strings (keys) for multiselect, String (key) and null for
		title: String,
		contentType: String,
		valueType: Number, // used to filter attributes
		attributes: {
			type: Array,
			default() { return [] },
		},
		multiselect: Boolean,
		disabled: Boolean,
	});

	let emit = defineEmits(['update:modelValue', 'selectedAttributesChanged']);
	// let evAttrsStore = useEvAttributesStore();

	let attributesList = ref(null);
	let selAttrsKeysList = ref([]);
	let modalIsOpen = ref(false);

	attributesList.value = JSON.parse(JSON.stringify( props.attributes ));

	function getSelAttrsKeysList() {

		if ( Array.isArray(props.modelValue) ) {

			selAttrsKeysList.value = JSON.parse(JSON.stringify( props.modelValue ));

		}
		else if (typeof props.modelValue === 'string') {

			selAttrsKeysList.value = props.modelValue ? [props.modelValue] : []

		} else if (props.modelValue || props.modelValue === 0) {
			throw new Error("Wrong format of modelValue: " + typeof props.modelValue)
		}

	}

	watch(() => props.attributes, () => {
		attributesList.value = JSON.parse(JSON.stringify( props.attributes ));
	})

	watch(
		() => props.modelValue,
		getSelAttrsKeysList,
	)

	function openDialog() {
		if (!props.disabled) modalIsOpen.value = true;
	}

	let selectedAttrs = computed(() => {
		return attributesList.value.filter( attr => selAttrsKeysList.value.includes(attr.key) );
	});

	let selectedName = computed( () => {

			if ( selectedAttrs.value[0] ) {

				return selectedAttrs.value[0].layout_name || selectedAttrs.value[0].name;

			}

			return props.title || '';

	});

	/*let selectedName = computed( () => {

		if ( selectedAttrs.value[0] ) {

			return selectedAttrs.value[0].layout_name || selectedAttrs.value[0].name;

		}

		return props.title || '';

	});*/

	if (props.multiselect) {

		selectedName = computed( () => {

			if ( !selectedAttrs.value.length ) {
				return props.title || '';
			}

			const names = selectedAttrs.value.map( attr => attr.layout_name || attr.name );

			return `[ ${names.join(', ')} ]`;

		});

	}

	// watch(() => props.modelValue, modelValueWatchHandler)
	getSelAttrsKeysList();

</script>

<style lang="scss" scoped>
	:deep(.base-input) {
		margin-bottom: 0;
	}

	.selected_text {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
</style>
