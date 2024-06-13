<template>
	<BaseModal
		title="Create Space"
		@cancel="cancel()"
	>
		<FmInputText
			label="Name"
			v-model="form.name"
			noIndicatorButton
		/>
		<BaseInput
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
					@click="createSpace()"
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
	async function createSpace() {
		if ( processing.value ) return false

		processing.value = true

		let res = await useApi('spaceBackup.put', {
			body: form,
			params: {id: props.backupId }
		})

		if ( res ) {
			useNotify({type: 'success', title: 'Space is proccessing'})
		}

		emit('save')
		cancel()
	}

</script>

<style lang="sass" scoped>
</style>
