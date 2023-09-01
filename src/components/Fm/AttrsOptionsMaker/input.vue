<template>
	<BaseInput
		:modelValue="inputText"
		:label="title"
		v-bind="$attrs"
		v-fm-tooltip="tooltipText"
		class="cursor-pointer"
		@click="showModal"
	>
		<template #button>
			<FmIcon icon="menu" />
		</template>
	</BaseInput>

	<FmAttrsOptionsMakerModal
		v-model="modalShown"
		:title="title"
		:attributes="attributes"
		:selectedAttributes="modelValue"
		:value_type="value_type"
		@save="options => emit('update:modelValue', options)"
	/>

</template>

<script setup>

	let props = defineProps({
		modelValue: {
			type: Array,
			default() { return [] },
		},
		title: {
			type: String,
			default: "Available attributes",
		},
		attributes: {
			type: Array,
			default() { return [] },
		},
		defaultAttrKey: String,
		value_type: Number,
		disabled: Boolean,
	});

	let emit = defineEmits(['update:modelValue']);

	let modalShown = ref(false);

	const selText = computed(() => {

		if (!props.modelValue || props.modelValue.length < 0) {
			return '';
		}

		let selString = '';

		props.modelValue.forEach(attribute => {

			if (selString) {
				selString += ', '
			}

			if (attribute.layout_name) {

				selString += attribute.layout_name;

			} else {
				selString += attribute.attribute_data.name;
			}

		});

		return selString;

	})

	const inputText = computed(() => selText.value ? `[ ${selText.value} ]` : '[ ]' );

	const tooltipText = computed(() => {
		return selText.value ? `Values selected: ${selText.value}` : null;
	});

	function getDefaultAttrFromAvailable () {

		for (var i = 0; i < props.attributes.length; i++) {

			if (props.attributes[i].key === props.defaultAttrKey) {

				return {
					attribute_data: JSON.parse(JSON.stringify( props.attributes[i] )),
					layout_name: '',
					isDefault: true
				};
			}

		}

		return false;

	}

	/** Update selected attributes if default attribute changed */
	function updateSelectedAttrs () {

		if ( (!props.modelValue || props.modelValue.length === 0) && props.defaultAttrKey ) {

			props.modelValue = [];

			const defaultAttr = getDefaultAttrFromAvailable();

			if (defaultAttr) {
				props.modelValue.push(defaultAttr);
			}

		}
		else if (props.defaultAttrKey) { // If props.modelValue is not empty

			if (props.modelValue[0].attribute_data.key === props.defaultAttrKey) {

				props.modelValue[0].isDefault = true;

			} else {

				props.modelValue[0].isDefault = false;

				var defaultAttr = null;

				// if default attribute is selected move it to the top of the array
				for (let i = 1; i < props.modelValue.length; i++) {

					if (props.modelValue[i].attribute_data.key === props.defaultAttrKey) {

						defaultAttr = props.modelValue[i];
						defaultAttr.isDefault = true;
						props.modelValue.splice(i, 1);
						props.modelValue.unshift(defaultAttr);
						break;

					}

				}

				// default attribute is not selected
				if (!defaultAttr) {

					defaultAttr = getDefaultAttrFromAvailable();
					props.modelValue.unshift(defaultAttr);

				}

				for (var i = 0; i < props.modelValue.length; i++) {
					props.modelValue[i].order = i;
				}

			}

		} else { // if default attribute changed to empty
			props.modelValue[0].isDefault = false;
		}

		emit('update:modelValue', props.modelValue);

	}

	watch(
		() => props.defaultAttrKey,
		updateSelectedAttrs,
	)

	function showModal() {
		if (props.disabled) {
			return;
		}

		modalShown.value = true;
	}

	updateSelectedAttrs();

</script>

<style lang="scss" scoped>

</style>
