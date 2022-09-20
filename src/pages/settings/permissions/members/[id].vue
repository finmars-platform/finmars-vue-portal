<template>
	<CommonSettingsLayout
		v-if="member.id"
		title="Update member"
		:saveFunc="save"
		:cancelFunc="cancel"
	>
		<template #left>
			<v-card class="mb-6">
				<v-card-title class="text-h5">General</v-card-title>
				<v-card-content>
					<v-text-field
						label="Name"
						placeholder="Name"
						variant="outlined"
						density="comfortable"
						v-model="member.username"
						disabled
					/>
					<v-text-field
						label="Date joined"
						placeholder="Date joined"
						variant="outlined"
						density="comfortable"
						:modelValue="fromatDate(member.join_date)"
						disabled
					/>
				</v-card-content>
			</v-card>
		</template>
		<template #right>
			<v-card class="mb-6">
				<v-card-title>Roles</v-card-title>
				<v-card-content>
					<v-text-field
						label="User roles"
						placeholder="User roles"
						variant="outlined"
						density="comfortable"
						v-model="member.username"
						disabled
					/>
					<BaseMultiSelect
						:modelValue="selectedGroups.join(',')"
						@update:modelValue="member.groups = findIds($event)"
						title="Groups"
						:items="groups"
					/>

					<v-checkbox
						v-model="member.is_owner"
						label="Owner"
						color="primary"
						hide-details
					></v-checkbox>
				</v-card-content>
			</v-card>
		</template>
	</CommonSettingsLayout>
</template>

<script setup>

	import moment from 'moment'

	definePageMeta({
		bread: [
			{
				text: 'Permissions: Members',
				to: '/settings/permissions',
				disabled: false
			},
			{
				text: 'Update member',
				disabled: true
			},
		],
	});
	const store = useStore()
	let route = useRoute()
	let router = useRouter()

	let member = ref({})
	let groups = ref({})
	let selectedGroups = computed(() => {
		if ( !member.value.groups_object ) return ''
		return member.value.groups_object.map( item => {
			return item.name
		})
	})

	async function init() {
		let res = await useApi('member.get', {params: {id: route.params.id}})
		member.value = res

		res = await useApi('userGroups.get')
		groups.value = res.results
	}
	function findIds( val ) {
		console.log('val:', val)
		let result = []
		 val.forEach( itemArr => {
			let elem = groups.value.find(itemObj => itemObj.name == itemArr)
			if ( elem ) result.push( elem.id )
		})
			console.log('result:', result)

		return result
	}
	async function save() {
		let res = await useApi('member.put', {body: member.value, params: {id: route.params.id}})

		if ( res ) useNotify({type: 'success', title: 'Saved!'})
	}
	async function cancel() {
		router.push('/settings/permissions')
	}
	function fromatDate( date ) {
		return moment( date ).format('DD.MM.YYYY LT')
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
