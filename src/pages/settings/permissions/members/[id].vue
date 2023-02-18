<template>
	<CommonSettingsLayout
		title="Update member"
		@save="save"
		@cancel="cancel"
	>
		<template #left>
			<FmCard title="General" v-if="member.id">
				<BaseInput
					label="Name"
					v-model="member.username"
					disabled
				/>
				<BaseInput
					label="Date joined"
					:modelValue="fromatDate(member.join_date)"
					disabled
				/>
			</FmCard>
		</template>
		<template #right>
			<FmCard title="Roles" class="m-b-24" v-if="member.id">
				<BaseInput
					label="User roles"
					v-model="member.username"
					disabled
				/>
				<BaseMultiSelectInput
					:modelValue="selectedGroups"
					@update:modelValue="findIds($event)"
					title="Groups"
					:items="groups"
					item_id="name"
				/>

				<FmCheckbox
					v-model="member.is_owner"
					label="Owner"
				/>
			</FmCard>
		</template>
	</CommonSettingsLayout>
</template>

<script setup>

	import dayjs from 'dayjs'

	definePageMeta({
		middleware: 'auth',
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
	let groups = ref([])
	let selectedGroups = computed(() => {
		if ( !member.value.groups_object ) return []
		return member.value.groups_object.map( item => item.name).join(',')
	})

	async function init() {
		let res = await useApi('member.get', {params: {id: route.params.id}})
		member.value = res

		res = await useApi('userGroups.get')
		groups.value = res.results
	}
	function findIds( val ) {
		if ( typeof val == 'string' ) val = val.split(',')
		let result = []
		val.forEach( itemArr => {
			let elem = groups.value.find(itemObj => itemObj.name == itemArr)
			if ( elem ) result.push( elem.id )
		})

		member.value.groups = result
		member.value.groups_object = member.value.groups_object
			.filter(item => member.value.groups.includes(item.id) )
	}
	async function save() {
		let res = await useApi('member.put', {body: member.value, params: {id: route.params.id}})

		if ( res ) useNotify({type: 'success', title: 'Saved!'})
	}
	async function cancel() {
		router.push('/settings/permissions')
	}
	function fromatDate( date ) {
		return dayjs( date ).format('DD.MM.YYYY LT')
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
