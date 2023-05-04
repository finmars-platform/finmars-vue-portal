<template>
		<BaseInput
			class="ms_wrap input_btn cursor-pointer"
			:label="title"
			v-bind="$attrs"
			:disabled="disabled"
			@click.stop="openDialog"
			:modelValue="modelValue"
		>
			<template #button><FmIcon icon="menu" /></template>

			<div v-if="multiselect" class="flex aic" style="height: inherit;">

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

			</div>
			<div v-else class="fm_select_main_input">

				<div
					class="selected_text"
					:class="{'nothing_selected': !modelValue || (Array.isArray(modelValue) && !modelValue.length) }"
				>
					{{ selectedName }}
				</div>

			</div>
		</BaseInput>

		<FmAttributesSelectModal
			v-model="modalIsOpen"
			:title="title"
			:contentType="contentType"
			:attributes="attributesList"
			:selected="modelValue"
			:multiselect="multiselect"
			@save="selected => emit('update:modelValue', selected)"
		/>
</template>

<script setup>

	import useEvAttributesStore from "~/stores/useEvAttributesStore";

	let props = defineProps({
		modelValue: [Array, String], // Array for multiselect, String for select
		title: String,
		contentType: String,
		attributes: {
			type: Array,
			default: []
		},
		multiselect: Boolean,
		disabled: Boolean,
	});

	let emit = defineEmits(['update:modelValue']);

	// let evAttrsStore = useEvAttributesStore();

	let attributesList = ref(null);
	let selAttrsKeysList = ref([]);
	let modalIsOpen = ref(false);

	attributesList.value = JSON.parse(JSON.stringify( props.attributes ));

	watch(() => props.attributes, () => {
		attributesList.value = JSON.parse(JSON.stringify( props.attributes ));
	})

	watch(
		() => props.modelValue,
		() => {

			if ( Array.isArray(props.modelValue) ) selAttrsKeysList.value = props.modelValue;

			if (typeof props.modelValue === 'string') {
				selAttrsKeysList.value = props.modelValue ? [props.modelValue] : []

			} else {
				throw new Error("Wrong format of modelValue: " + typeof props.modelValue)
			}

		}
	)

	function openDialog() {
		if (!props.disabled) modalIsOpen.value = true;
	}

	let selectedAttrs = computed(() => {
		return attributesList.value.filter( attr => selAttrsKeysList.value.includes(attr.key) )
	});

	let selectedName = computed( () => {

		if ( selectedAttrs.value[0] ) {

			return selectedAttrs.value[0].layout_name || selectedAttrs.value[0].name;

		}

		return props.title || '';

	});

	// watch(() => props.modelValue, modelValueWatchHandler)

</script>

<style lang="scss" scoped>
	:deep(.base-input) {
		margin-bottom: 0;
	}
</style>
