<template>
	<BaseModal
		title="Create Space"
	>
		<BaseInput
			label="Name"
			v-model="form.name"
		/>



		<BaseInput
			label="License key"
			v-model="form.license_key"
		/>

		<FmInputFile label="Select file" @change="addFile" />

		<FmCheckbox
			label="Replace space code"
			v-model="form.replace_old_space_code"
            class="m-b-24"
		/>

		<template #controls>
			<div class="flex sb">
				<FmBtn type="text" @click="cancel()">cancel</FmBtn>
				<FmBtn :disabled="processing" @click="createDB()">create</FmBtn>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
	let emit = defineEmits(['cancel'])
	let form = reactive({})
	form.replace_old_space_code = true
	let processing = ref(false)

	function cancel() {
		emit('cancel')
		processing.value = false
	}
	async function createDB() {
		if ( processing.value ) return false

		let FD  = new FormData();

		for( let prop in form ) {
			FD.append( prop, form[ prop ] );
		}

		processing.value = true

		let res = await useApi('masterCreateFrom.post', {body: FD })

		if ( res ) {
			useNotify({type: 'success', title: 'Space is proccessing'})
		}

		cancel()
	}
	function addFile( event ) {
		form.file = event.target.files[0]
	}

</script>

<style lang="sass" scoped>
</style>
