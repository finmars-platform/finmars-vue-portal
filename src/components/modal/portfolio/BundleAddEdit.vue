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
		}
	});

	let emit = defineEmits(['save']);

	let bundleName = ref(props.name);
	let bundleRegistersList = ref(props.bundleRegisters);
	let registers = ref([])

	watch(
		() => props.name,
		() => bundleName.value = props.name
	)

	watch(
		() => props.bundleRegisters,
		() => bundleRegistersList.value = props.bundleRegisters
	)
	fetchPrtfRegistersList()
	async function fetchPrtfRegistersList() {

		const res = await useApi('portfolioRegisterEvFiltered.post', {
			body: '{"groups_types":[],"page":1,"groups_values":[],"groups_order":"asc","page_size":60,"ev_options":{"entity_filters":["enabled","disabled","active","inactive"]},"filter_settings":[],"global_table_search":"","is_enabled":"any"}'
		});

		if (!res.error) {

			registers.value = res.results.map((o) => ({
					user_code: o.user_code,
					id: o.id,
				})
			);

		}

	}
	function resetBundleData () {
		bundleName.value = props.name;
		bundleRegistersList.value = props.bundleRegisters;
	}

</script>

<style lang="scss" scoped>

</style>
