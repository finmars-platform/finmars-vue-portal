<template>
	 <v-dialog>
			<v-card width="426">
				<v-card-title>
					Create Database
				</v-card-title>

				<v-card-content>
					<v-text-field
						label="Name"
						placeholder="Name"
						variant="outlined"
						density="comfortable"
						v-model="form.name"
					/>
					<v-text-field
						label="License key"
						placeholder="License key"
						variant="outlined"
						density="comfortable"
						v-model="form.license_key"
					/>
				</v-card-content>
				<v-card-actions class="space-between pa-4">
					<v-btn color="primary" @click="close()">cancel</v-btn>
					<v-btn color="primary" variant="contained" @click="createDB()">create</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
</template>

<script setup>
	let emit = defineEmits(['close'])
	let form = reactive({})
	let processing = ref(false)

	async function close() {
		emit('close')
		processing.value = false
	}
	async function createDB() {
		if ( processing.value ) return false

		processing.value = true

		let res = await useApi('masterBackups.put', {body: form })

		if ( res ) {
			useNotify({type: 'success', title: 'Ecosystem is proccessing'})
		}

		close()
	}

</script>

<style lang="sass" scoped>
</style>
