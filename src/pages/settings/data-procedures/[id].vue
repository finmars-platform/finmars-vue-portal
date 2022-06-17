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
						<FmDateExpr
							label="Date from"
							:expr="procedure.date_from_expr"
							:date="procedure.date_from"
							@save:date="procedure.date_from = $event"
							@save:expr="procedure.date_from_expr = $event"
						/>
						<FmDateExpr
							label="Date to"
							:expr="procedure.date_to_expr"
							:date="procedure.date_to"
							@save:date="procedure.date_to = $event"
							@save:expr="procedure.date_to_expr = $event"
						/>
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

						<FmMultiField
							label="Scheme name"
							v-model="procedure.scheme_user_code"
							:type="procedure.scheme_type"
							:items="types"
							:simpleItems="simpleItems"
							@selected:type="procedure.scheme_type = $event"
						/>

						<template v-if="procedure.provider == 1">
							<v-text-field
								label="Filename pattern"
								placeholder="Filename pattern"
								variant="outlined"
								density="comfortable"
								v-model="procedure.data.filenamemask"
							/>
						</template>

						<template v-if="procedure.provider == 3">
							<v-text-field
								label="Archive password"
								placeholder="Archive password"
								variant="outlined"
								density="comfortable"
								v-model="procedure.data.archivepassword"
							/>
						</template>

						<template v-if="procedure.provider == 4">
							<v-text-field
								label="Code"
								placeholder="Code"
								variant="outlined"
								density="comfortable"
								v-model="procedure.data.code"
							/>
							<v-text-field
								label="Issuer"
								placeholder="Issuer"
								variant="outlined"
								density="comfortable"
								v-model="procedure.data.issuer"
							/>
							<v-text-field
								label="Client id"
								placeholder="Client id"
								variant="outlined"
								density="comfortable"
								v-model="procedure.data.client_id"
							/>
							<v-text-field
								label="jwt"
								placeholder="jwt"
								variant="outlined"
								density="comfortable"
								v-model="procedure.data.jwt"
							/>
						</template>

						<template v-if="procedure.provider == 5">
							<v-text-field
								label="Sender pattern"
								placeholder="Sender pattern"
								variant="outlined"
								density="comfortable"
								v-model="procedure.data.sender"
							/>
							<v-text-field
								label="Subject pattern"
								placeholder="Subject pattern"
								variant="outlined"
								density="comfortable"
								v-model="procedure.data.subject"
							/>
							<v-text-field
								label="Filename pattern"
								placeholder="Filename pattern"
								variant="outlined"
								density="comfortable"
								v-model="procedure.data.filename"
							/>
						</template>

						<template v-if="procedure.provider == 6">
							<v-text-field
								label="Url"
								placeholder="Url"
								variant="outlined"
								density="comfortable"
								v-model="procedure.data.url"
							/>
							<v-text-field
								label="Security token"
								placeholder="Security token"
								variant="outlined"
								density="comfortable"
								v-model="procedure.data.security_token"
							/>
							<v-textarea
								label="JSON"
								variant="outlined"
								density="comfortable"
								:modelValue="JSON.stringify( procedure.data, null, 2)"
								filled
								rows="10"
								@update:modelValue="procedure.data = JSON.parse($event)"
							></v-textarea>
						</template>
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
	let simpleItems = ref()

	let types = ref([
		{id: 'simple_import', name: 'Simple Import', icon: 'SI'},
		{id: 'transaction_import', name: 'Transaction Import', icon: 'TI'},
	])

	async function init() {
		let res = await useApi('importBankProcId.get', {params: {id: route.params.id}})
		procedure.value = res

		simpleItems.value = (await useApi('importSchemeLight.get')).results
		simpleItems.value.forEach(item => {
			item.title = item.name
			item.value = item.name
		})

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
