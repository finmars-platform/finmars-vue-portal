<template>
	<BaseModal
		:title="`${actionType === 'add' ? 'Add' : 'Edit'} bundle`"
		@close="resetBundleData"
	>

		<FmInputText
			label="Name"
			v-model="bundleName"
		/>

		<BaseMultiSelectTwoAreas
			class="p-b-16"
			v-model="bundleRegistersList"
			:items="registers"
			item_id="id"
			item_title="user_code"
			@update:modelValue="newValue => bundleRegistersList = newValue"
		/>

		<template #controls="{ cancel }">
			<div class="flex sb">
				<FmBtn type="basic" @click="cancel()">cancel</FmBtn>

				<FmBtn
					:disabled="!bundleName"
					@click="emit('save', { name: bundleName, registers: JSON.parse(JSON.stringify(bundleRegistersList)) }), cancel()"
				>{{ actionType === 'add' ? 'create' : 'save' }}</FmBtn>

			</div>
		</template>
	</BaseModal>
</template>

<script setup>

	let props = defineProps({
		actionType: {
			type: String,
			default: 'add'
		},
		name: {
			type: String,
			default: '',
		},
		bundleRegisters: {
			type: Array,
			default: [],
		},
		registers: {
			type: Array,
			default: [],
		}
	});

	let emit = defineEmits(['save']);

	let bundleName = ref(props.name);
	let bundleRegistersList = ref(props.bundleRegisters);

	watch(
		() => props.name,
		() => bundleName.value = props.name
	)

	watch(
		() => props.bundleRegisters,
		() => bundleRegistersList.value = props.bundleRegisters
	)

	function resetBundleData () {
		bundleName.value = props.name;
		bundleRegistersList.value = props.bundleRegisters;
	}

</script>

<style lang="scss" scoped>

</style>
