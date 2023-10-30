<template>
	<CommonSettingsLayout
		title="Update Data Procedure"
		@save="save()"
		@cancel="() => $router.push('/import/bank')"
	>
		<template #left>
			<FmCard title="Global" class="mb-x">
				<BaseInput label="Name" v-model="procedure.name" />
				<BaseInput label="User code" v-model="procedure.user_code" />
				<BaseInput label="Notes" v-model="procedure.notes" />
				<BaseInput label="Notes for user" v-model="procedure.notes_for_users" />
			</FmCard>

			<FmCard title="Period" class="mb-x">
				<FmInputDateExpr
					label="Date from"
					v-model:expr="procedure.date_from_expr"
					v-model:date="procedure.date_from"
				/>
				<FmInputDateExpr
					label="Date to"
					v-model:expr="procedure.date_to_expr"
					v-model:date="procedure.date_to"
				/>
			</FmCard>
		</template>
		<template #right>
			<FmCard title="Provider and schemes" class="mb-x">
				<FmSelect
					v-model="procedure.provider"
					:items="dataProvider"
					label="Provider"
				/>

				<FmSelectDouble
					label="Scheme name"
					v-model="procedure.scheme_user_code"
					v-model:type="procedure.scheme_type"
					:items="types"
					:simpleItems="simpleItems"
					prop_id="user_code"
				/>

				<template v-if="procedure.provider == 1">
					<BaseInput
						label="Filename pattern"
						v-model="procedure.data.filenamemask"
					/>
				</template>

				<template v-if="procedure.provider == 3">
					<BaseInput
						label="Archive password"
						v-model="procedure.data.archivepassword"
					/>
				</template>

				<template v-if="procedure.provider == 4">
					<BaseInput label="Code" v-model="procedure.data.code" />
					<BaseInput label="Issuer" v-model="procedure.data.issuer" />
					<BaseInput label="Client id" v-model="procedure.data.client_id" />
					<BaseInput label="jwt" v-model="procedure.data.jwt" />
				</template>

				<template v-if="procedure.provider == 5">
					<BaseInput label="Sender pattern" v-model="procedure.data.sender" />
					<BaseInput label="Subject pattern" v-model="procedure.data.subject" />
					<BaseInput
						label="Filename pattern"
						v-model="procedure.data.filename"
					/>
				</template>

				<template v-if="procedure.provider == 6">
					<BaseInput label="Url" v-model="procedure.data.url" />
					<BaseInput
						label="Security token"
						v-model="procedure.data.security_token"
					/>
					<FmInputArea
						label="JSON"
						:modelValue="JSON.stringify(procedure.data, null, 2)"
						@update:modelValue="procedure.data = JSON.parse($event)"
					/>
				</template>
			</FmCard>
		</template>
	</CommonSettingsLayout>
</template>

<script setup>
	definePageMeta({
		bread: [
			{
				text: 'Import: Import from bank ',
				to: '/import/bank',
				disabled: false,
			},
			{
				text: 'Update Data Procedure ',
				disabled: true,
			},
		],
	})
	const store = useStore()
	let route = useRoute()

	let dataProvider = ref([])

	let pricing_conditions = ref()
	let currency_condition = ref()
	let simpleItems = ref()

	let types = ref([
		{ id: 'simple_import', name: 'Simple Import', icon: 'SI' },
		{ id: 'transaction_import', name: 'Transaction Import', icon: 'TI' },
	])

	let { data: procedure } = await useAsyncData('importBankProcId', () => {
		return useApi('importBankProcId.get', { params: { id: route.params.id } })
	})

	async function init() {
		if (!procedure.value.data) procedure.value.data = {}

		simpleItems.value = (await useApi('importSchemeLight.get')).results
		simpleItems.value.forEach((item) => {
			item.title = item.name
			item.value = item.name
		})

		dataProvider.value = await useApi('dataProvider.get')
	}

	async function save() {
		let res = await useApi('importBankProcId.put', {
			body: procedure.value,
			params: { id: route.params.id },
		})

		if (res) {
			useNotify({ type: 'success', title: 'Saved!' })
		}
	}

	if (store.current.base_api_url) {
		init()
	} else {
		watch(
			() => store.current,
			async () => {
				init()
			}
		)
	}
</script>

<style lang="scss" scoped></style>
