<template>
	<BaseModal title="System Error log">

		<div class="warning-text p-16">

			<div v-for="item in store.systemErrors"
					 class="error_data flex-row m-b-24">

				<div class="flex-column m-r-16">
					<div class="error_date_container">
						<b>Date</b>: {{formatDate(item.created)}}
					</div>

					<div class="location_container">
						<b>Website location</b>: {{item.location}}
					</div>

				</div>

<!--				<div>
					<div v-if="item.data" layout="column">

						<div>
							<b>Status</b>: {{item.data.status}} {{item.data.statusText}}
						</div>

						<div v-if="item.data.message.url">
							<b>API URL</b>: {{item.data.message.url}}
						</div>

						<div class="m-t-16" v-if="item.data.message.message">

							<b>Message</b>:
							<p>
								{{item.data.message.message}}
							</p>
						</div>

						<div class="p-b-16" v-if="item.data.message.trace">

							<div><b >Traceback</b>:</div>

							<code v-html="item.data.message.trace" style="white-space: pre;">
							</code>

						</div>

						<div v-if="item.textMessage">
							<code v-html="item.textMessage" style="white-space: pre;">
							</code>
						</div>


					</div>


				</div>-->
				<div>
					{{item.text}}
				</div>

			</div>
		</div>

		<template #controls>
			<div class="flex-row fc-space-between">
				<a ref="downloadEfElem"
					 :href="getDownloadLink()"
					 @click="downloadErrorFile()"><FmBtn type="basic">DOWNLOAD ERROR FILE</FmBtn></a>

				<FmBtn type="basic" @click="emit('cancel')">CLOSE</FmBtn>
			</div>
		</template>

	</BaseModal>
</template>

<script setup>
	import moment from 'moment'

	let emit = defineEmits(['cancel'])
	const store = useStore();

	let downloadEfElem = ref(null);

	/*const errors = computed(() => {

		return store.systemErrors.map(errorData => {

			if (errorData.data && errorData.data.hasOwnProperty('message')) {

				if (errorData.data.message && errorData.data.message.hasOwnProperty('url')) {
					// structured 500 error here
				} else {
					// other error with various structure
					errorData.textMessage = JSON.stringify(errorData.data.message, null, 2);
				}

			}

			return errorData

		});

	});*/

	function formatDate(date) {
		return moment(date).format('dd/MM/yyyy HH:mm');
	}

	function getDownloadLink() {

		// var link = document.querySelector('.download-system-error-log');

		const currentMasterUser = store.masterUser;
		const user = store.user;

		const data = {

			master_user: currentMasterUser.name,
			username: user.username,
			date: new Date().toISOString(),
			errors: store.systemErrors

		};

		const text = JSON.stringify(data)

		const file = new Blob([text], {type: 'text/plain'});

		// link.href = URL.createObjectURL(file);
		return URL.createObjectURL(file);

	}

	function downloadErrorFile() {
		downloadEfElem.value.download = 'System Error Log ' + new Date().toISOString() + '.json';
		emit('cancel');
	}

</script>

<style lang="scss" scoped>
	.error_data {
		padding-bottom: 8px;
		border-bottom: 1px solid $border-darken;
	}

	.error_date_container {
		width: 360px;
	}

	.location_container {
		word-break: break-word;
	}
</style>
