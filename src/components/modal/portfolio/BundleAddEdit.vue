<template>
	<BaseModal
		:title="`${actionType === 'add' ? 'Add' : 'Edit'} bundle`"
		@close="resetBundleData"
	>

		<div v-if="readyStatus">
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
		</div>

		<div v-else class="loader_container">
			<FmLoader :size="60" positionCenter/>
		</div>

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
			default() { return [] },
		}
	});

	let emit = defineEmits(['save']);

	let readyStatus = ref(false);
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

	async function fetchPrtfRegistersList() {

		readyStatus.value = false;

		const body = {
			"groups_types": [],
			"page": 1,
			"groups_values": [],
			"groups_order": "asc",
			"page_size": 1000,
			"ev_options": {
				"entity_filters": ["enabled","disabled","active","inactive"],
			},
			"filter_settings": [],
			"global_table_search": "",
			"is_enabled": "any",
		};

		const res = await useApi(
			'portfolioRegisterEvFiltered.post', {
			body: body,
		});

		if (!res._$error) {

			registers.value = res.results.map((o) => ({
					user_code: o.user_code,
					id: o.id,
				})
			);

			readyStatus.value = true;

		}

	}
	function resetBundleData () {
		bundleName.value = props.name;
		bundleRegistersList.value = props.bundleRegisters;
	}

	fetchPrtfRegistersList();

</script>

<style lang="scss" scoped>

.loader_container {
	min-width: 350px;
	min-height: 400px;
}

</style>
