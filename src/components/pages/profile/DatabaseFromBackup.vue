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

					<v-file-input
						label="File input"
						variant="outlined"
						density="comfortable"
						prepend-icon
						prepend-inner-icon="mdi-paperclip"
						@change="addFile"
					>
						<template v-slot:selection="{ fileNames }">
							<template v-for="fileName in fileNames" :key="fileName">
								{{ fileName.length > 30 ? fileName.slice(0,30) + '...' : fileName }}
							</template>
						</template>
					</v-file-input>
				</v-card-content>
				<v-card-actions class="space-between">
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

		let FD  = new FormData();

		for( let prop in form ) {
			FD.append( prop, form[ prop ] );
		}

		processing.value = true

		let res = await useApi('masterCreateFrom.post', {body: FD })

		if ( res ) {
		}

		close()
	}
	function addFile( event ) {
		form.file = event.target.files[0]
	}

</script>

<style lang="sass" scoped>
</style>
