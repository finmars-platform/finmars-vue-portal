<template>
	<div class="fm_container databases">
		<FmCard class="settings_block" title="Personal data" controls>
			<BaseInput
				label="First name"
				v-model="formUser.first_name"
				:error="errors.first_name"
			/>
			<BaseInput
				label="Last name"
				v-model="formUser.last_name"
				:error="errors.last_name"
			/>
			<BaseInput
				label="E-mail"
				v-model="formUser.email"
				:error="errors.email"
			/>

			<BaseFileInput
				label="Profile Picture"
				v-model="formUser.profile_picture"
				@onUpload="uploadProfilePicture"
				:error="errors.profile_picture"
			/>

			<template #controls>
				<div class="flex jcfe">
					<FmBtn @click="saveUser()">save</FmBtn>
				</div>
			</template>
		</FmCard>

		<FmCard class="settings_block" title="Additional settings">
			<a class="link" :href="config.public.cloack2fa">Two-factor Authentication</a>
			<a class="link" :href="config.public.cloackPass">Change settings</a>

			<FmCheckbox
				:label="'Code editor'"
				v-model="formUser.data.codeEditor"
				@update:modelValue="saveUser()"
			/>

			<FmCheckbox
				:label="'Universal Input'"
				v-model="universalInput"
				@update:modelValue="updateUniversalInput()"
			/>

		</FmCard>
	</div>
</template>

<script setup>

const store = useStore()
const config = useRuntimeConfig()

let formUser = store.user
let errors = ref({})
let universalInput = ref()

async function updateUniversalInput() {

	if (universalInput) {
		window.localStorage.setItem("universalInputEnabled", "true")
	} else {
		window.localStorage.setItem("universalInputEnabled", "false")
	}

}

async function uploadProfilePicture(data) {

	console.log("Upload profile picture", data);

	let formData = new FormData();
	formData.append("profile_picture", data);

	let token = useCookie('access_token').value
	let prefix = useRuntimeConfig().public.authorizerURL

	let url = prefix + '/user/0/upload-profile-picture/'
	let headers = {
		Authorization: "Token " + token,
	}
	let options = {
		method: 'PUT',
		headers: headers,
		body: formData,
	}

	let response = await $fetch(url, options)

}

async function saveUser() {
	let res = await useApi('me.put', {body: formUser})

	if (!res.error) {
		useNotify({
			type: 'success',
			title: 'Saved'
		})

	} else {

		errors.value = res.error
	}
}

</script>

<style lang="scss" scoped>
.databases {
	display: grid;
	grid-template-columns: repeat(3, auto);
	grid-gap: 30px;
	justify-content: flex-start;
}

.settings_block {
	width: 360px;
}

.link {
	color: $primary;
	margin-bottom: 20px;
}
</style>
