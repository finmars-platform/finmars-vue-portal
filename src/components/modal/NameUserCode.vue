<template>
	<BaseModal v-model="modelValue"
						 @update:modelValue="emit('update:modelValue')">

		<div>
			<FmInputText label="Name" v-model="newName" />

			<!-- TODO: use UserCode component -->
			<FmInputText label="User Code" v-model="newUserCode" />
		</div>

		<template #controls="{ cancel }">
			<div class="flex-row fc-space-between">
				<FmBtn type="basic" @click="() => cancelModal(cancel)">CANCEL</FmBtn>

				<FmBtn type="basic" @click="save()">SAVE</FmBtn>
			</div>
		</template>

	</BaseModal>

</template>

<script setup>
	let props = defineProps({
		modelValue: Boolean,
		name: String,
		user_code: String,
	})

	let emit = defineEmits(['save', 'update:modelValue'])

	let newName = ref(props.name);
	let newUserCode = ref(props.user_code);

	watch(() => props.name, () => newName.value = props.name)
	watch(() => props.user_code, () => newUserCode.value = props.user_code)

	function save() {
		emit('save', {name: newName.value, user_code: newUserCode.value});
		console.log("testing save used");
	}

	function cancelModal(cancelFn) {
		newName.value = props.name;
		newUserCode.value = props.user_code;

		cancelFn();
	}

</script>

<style lang="scss" scoped>

</style>
