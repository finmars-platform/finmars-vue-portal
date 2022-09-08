<template>
	<BaseInput
		type="text"
		:label="label"
		:modelValue="name"
		@update:modelValue="$emit('update:name', $event)"
	>
		<template #button>
			<FmMenu>
				<template #btn>
					<FmIcon icon="new_label" />
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
				</div>
			</FmMenu>
		</template>
	</BaseInput>
</template>

<script setup>

	let props = defineProps({
		label: String,
		name: String,
		short_name: String,
		user_code: String,
		public_name: String,
	});

	let emit = defineEmits([
		"update:name",
		"update:short_name",
		"update:user_code",
		"update:public_name",
	]);
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
