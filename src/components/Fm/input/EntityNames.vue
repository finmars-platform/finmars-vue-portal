<template>
	<div>
		<FmMenu :opened="menuIsOpened"
						anchor="top left"
						attach="body"
						menuWidth="activator"
						:openOnClick="false"

						:offsetX="-13"
						:offsetY="-24"

						class="width-100"

						@cancel="() => menuIsOpened = false">

			<template #btn>
				<BaseInput
					type="text"
					:label="label"
					:modelValue="baseInputVal"
					@update:modelValue="setNames"
				>
					<template #button>
						<FmIcon icon="new_label" @click="menuIsOpened = true" />
					</template>
				</BaseInput>
			</template>

			<div class="e_names_popup">
				<div>
					<FmInputText
						label="Full name"
						:modelValue="name"
						@update:modelValue="$emit('update:name', $event)"
					/>
				</div>
				<div>
					<FmInputText
						label="Short name"
						:modelValue="short_name"
						@update:modelValue="$emit('update:short_name', $event)"
					/>
				</div>
				<div>
					<FmInputText
						label="User code"
						:modelValue="user_code"
						@update:modelValue="$emit('update:user_code', $event)"
					/>
				</div>
				<div>
					<FmInputText
						class="m-b-0"
						label="Public name"
						:modelValue="public_name"
						@update:modelValue="$emit('update:public_name', $event)"
					/>
				</div>
				<div v-if="!hideValueToShow">
					<FmInputSelect
						class="m-b-0"
						label="Show by default"
						:modelValue="valueToShow"
						:menuOptions="valueToShowOptions"
						@update:modelValue="onValueToShowChange"
					/>
				</div>
			</div>
		</FmMenu>

	</div>
</template>

<script setup>

	let props = defineProps({
		label: String,
		name: String,
		short_name: String,
		user_code: String,
		public_name: String,
		valueToShow: {
			type: String,
			default: 'name',
		},
		hideValueToShow: Boolean,
		/** Use when editing existent entity names **/
		editing: Boolean,
	});

	let emit = defineEmits([
		"update:name",
		"update:short_name",
		"update:user_code",
		"update:public_name",
		"update:valueToShow",
	]);

	let labelText = ref(props.valueToShow);
	if (props.label) labelText.value = props.label;

	let menuIsOpened = ref(false);

	let baseInputVal = ref('');

	const valueToShowOptions = [
		{
			id: "name",
			name: "name",
		},
		{
			id: "short_name",
			name: "Short Name",
		}
	];

	function onValueToShowChange(newValueToShow) {

		baseInputVal.value = props[newValueToShow];

		if (!props.label) {
			const selOpt = valueToShowOptions.find(opt => opt.id === newValueToShow);
			labelText.value = selOpt.name;
		}

		emit("update:valueToShow", newValueToShow);

	}

	/**
	 * Update name based on new value of base input
	 *
	 * @param {String} propName - 'name', 'short_name', 'user_code', 'public_name'
	 * @param {String} newValue - value after changing base input
	 */
	function updateName(propName, newValue) {

		// change field if it is empty or having the same value as baseInput
		if (!props[propName] || props[propName] === baseInputVal.value) {

			emit("update:" + propName, newValue);

		}

	}

	function setNames(newValue) {

		if (!props.label) {
			const selOpt = valueToShowOptions.find(opt => opt.id === props.valueToShow);
			labelText.value = selOpt.name;
		}

		updateName('name', newValue);
		updateName('short_name', newValue);

		if (!props.editing) {
			updateName('user_code', newValue);
		}

		updateName('public_name', newValue);

		baseInputVal.value = newValue;

	}

</script>

<style lang="scss" scoped>
.e_names_popup {
	min-width: 340px;
	padding: 24px 16px;
}

.base_input_holder {
	:deep(.base-input) {
		cursor: pointer;
	}

	:deep(.base-input .bi_main_input) {
		cursor: pointer;
	}
}
</style>
