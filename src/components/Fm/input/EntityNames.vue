<template>
	<FmMenu anchor="top" :offset-y="-17">
		<template #btn>
			<div class="base_input_holder">
				<BaseInput :label="label"
									 :modelValue="fullName"
									 :readonly="true"
									 type="text">
					<template #button>
						<FmIcon icon="new_label" />
					</template>
				</BaseInput>
			</div>
		</template>

		<div class="e_names_popup">
			<div>
				<FmInputText label="Full name"
										 :modelValue="fullName"
										 @update:modelValue="emit('update:fullName')" />
			</div>
			<div>
				<FmInputText label="Short name"
										 v-model="shortName"
										 @update:modelValue="emit('update:shortName')" />
			</div>
			<div>
				<FmInputText label="User code"
										 v-model="userCode"
										 @update:modelValue="emit('update:userCode')" />
			</div>
			<div>
				<FmInputText label="Public name"
										 v-model="publicName"
										 @update:modelValue="emit('update:publicName')" />
			</div>
		</div>
	</FmMenu>

</template>

<script setup>

let props = defineProps({
	label: ref,
	fullName: ref,
	shortName: ref,
	publicName: ref,
	userCode: ref,
})

let emit = defineEmits(['update:fullName', 'update:shortName', 'update:publicName', 'update:userCode']);

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
