<template>
	<v-container fluid v-if="procedure.id" class="pb-16 mb-10">
		<div class="text-h5 mb-3">Update Pricing Procedure</div>
		<div class="d-flex space-between">
			<div class="coll">
				<v-card class="mb-6">
					<v-card-title>Global</v-card-title>
					<v-card-content>
						<v-text-field
							label="Name"
							placeholder="Name"
							variant="outlined"
							density="comfortable"
							v-model="procedure.name"
						/>
						<v-text-field
							label="User code"
							placeholder="User code"
							variant="outlined"
							density="comfortable"
							v-model="procedure.user_code"
						/>
						<v-text-field
							label="Notes"
							placeholder="Notes"
							variant="outlined"
							density="comfortable"
							v-model="procedure.notes"
						/>
						<v-text-field
							label="Notes for user"
							placeholder="Notes for users"
							variant="outlined"
							density="comfortable"
							v-model="procedure.notes_for_users"
						/>
					</v-card-content>
				</v-card>

				<v-card>
					<v-card-title>Period</v-card-title>
					<v-card-content>

					</v-card-content>
				</v-card>
			</div>
			<div class="coll">
				<v-card>
					<v-card-title>Provider and schemes</v-card-title>
					<v-card-content>
						<v-select
							v-model="procedure.provider"
							:items="dataProvider"
							label="Provider"
							variant="outlined"
							density="compact"
						/>
					</v-card-content>
				</v-card>
			</div>
		</div>

		<v-sheet class="control_line pa-4 d-flex space-between">
			<v-btn variant="text" @click="$router.push('/valuations/run-pricing')">cancel</v-btn>
			<v-btn color="primary" @click="save()">save</v-btn>
		</v-sheet>

	</v-container>
</template>

<script setup>

	definePageMeta({
		title: "Update Pricing Procedure ",
	});
	const store = useStore()
	let route = useRoute()

	let procedure = ref({})
	let dataProvider = ref([])

	let pricing_conditions = ref()
	let currency_condition = ref()

	async function init() {
		let res = await useApi('importBankProcId.get', {params: {id: route.params.id}})
		procedure.value = res

		dataProvider.value = await useApi('dataProvider.get')
		dataProvider.value.forEach(item => {
			item.title = item.name
			item.value = item.id
		})
	}

	async function save() {
		let res = await useApi('importBankProcId.put', {body: procedure.value, params: {id: route.params.id}})

		if ( res ) {
			useNotify({type: 'success', title: 'Saved!'})
		}
	}

	if ( store.current.base_api_url ) {
		init()
	} else {
		watch( () => store.current, async () => {
			init()
		})
	}

</script>

<style lang="scss" scoped>
.coll {
	width: 48%;
}
.control_line {
	width: calc(100% - 160px);
	position: fixed;
	left: 160px;
	bottom: 0;
	border-top: 1px solid $border;
}
</style>
