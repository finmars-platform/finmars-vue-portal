<template>
	<BaseModal
		title="Create Database"
	>
		<BaseInput
			label="Name"
			v-model="form.name"
		/>
		<BaseInput
			label="License key"
			v-model="form.license_key"
		/>

		<template #controls>
			<div class="flex-row fc-space-between">
				<FmBtn type="basic" @click="close()">cancel</FmBtn>
				<FmBtn
					:loading="processing"
					@click="createMasterUser()"
				>
					create
				</FmBtn>
			</div>
		</template>

	</BaseModal>
</template>

<script setup>
	let emit = defineEmits(['close', 'save'])
	let form = reactive({})
	let processing = ref(false)

	async function close() {
		emit('close')
		processing.value = false
	}
	async function createMasterUser() {
		if ( processing.value ) return false

		processing.value = true

		let res = await useApi('masterBackups.put', {body: form })

		if ( res ) {
			useNotify({type: 'success', title: 'Ecosystem is proccessing'})
		}

		emit('save')
		close()
	}

</script>

<style lang="sass" scoped>
</style>
