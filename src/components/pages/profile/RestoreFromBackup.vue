<template>
	<BaseModal
		title="Create Database"
		@cancel="cancel()"
	>
		<FmInputText
			label="Name"
			v-model="form.name"
			noIndicatorButton
		/>
		<FmInputText
			label="License key"
			v-model="form.license_key"
			noIndicatorButton
		/>
		<FmInputText
			label="Realm code"
			v-model="form.realm_code"
			noIndicatorButton
		/>

		<template #controls>
			<div class="flex-row fc-space-between">
				<FmBtn type="basic" @click="cancel()">cancel</FmBtn>
				<FmBtn
					:disabled="processing"
					@click="createMasterUser()"
				>
					create
				</FmBtn>
			</div>
		</template>

	</BaseModal>
</template>

<script setup>
	let props = defineProps(['backupId'])
	let emit = defineEmits(['cancel', 'save'])

	let form = reactive({})
	let processing = ref(false)

	async function cancel() {
		emit('cancel')
		processing.value = false
	}
	async function createMasterUser() {
		if ( processing.value ) return false

		processing.value = true

		let res = await useApi('masterBackups.put', {
			body: form,
			params: {id: props.backupId }
		})

		if ( res ) {
			useNotify({type: 'success', title: 'Ecosystem is proccessing'})
		}

		emit('save')
		cancel()
	}

</script>

<style lang="sass" scoped>
</style>
