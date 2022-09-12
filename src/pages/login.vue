<template>
	<div class="wrap flex sb aic">
		<div class="left">
			<NuxtLink to="/">
				<img width="200" src="/img/logo.png" class="sidenav-logo" alt="" />
			</NuxtLink>

			<h2>Welcome back</h2>

			<input class="input" v-model="form.username" type="text" placeholder="Username" />
			<input class="input" v-model="form.password" type="password" placeholder="Password" />

			<div class="flex jcfe">
				<a class="forgot text"
					href="https://keycloak.finmars.com:8443/realms/finmars/login-actions/reset-credentials"
				>
					Forgot password?
				</a>
			</div>

			<FmBtn class="action_btn" @click="login()">login to your account</FmBtn>

			<p class="bot_text flex">
				Dont't have an account?
				<NuxtLink class="m-l-10 white" to="/signup">Sign Up</NuxtLink>
			</p>
		</div>
		<div class="right"></div>
	</div>
</template>

<script setup>
	definePageMeta({
		layout: "auth",
		title: "Finmars | Login",
	});

	let form = reactive({})

	async function login() {
		let res = await useApi('login.post', { body: form })

		if ( res.success ) {
			useCookie('access_token').value = res.access_token
			useCookie('refresh_token').value = res.refresh_token

			navigateTo('/profile')
		}
	}
</script>

<style lang="scss" scoped>
.wrap {
	height: 100vh;
	background: #000;
	color: #555555;
}
.text {
	color: #555555;
}
h2 {
	color: $separ;
	font-weight: 24px;
	font-weight: 700;
	margin: 50px 0 20px;
}
.input {
	background: rgba(255, 255, 255, 0.11764705882352941);
	height: 56px;
	width: 100%;
	color: #fff;
	font-size: 16px;
	border: 0;
	outline: none;
	padding-left: 8px;
	padding: 2px 16px 2px 16px;
	margin-bottom: 24px;
}
.left {
	max-width: 360px;
	width: 100%;
	margin-left: 60px;
}
.forgot {
	transition: 0.3s;
	margin-bottom: 24px;
	&:hover {
		color: $separ;
	}
}
.action_btn {
	width: 100%;
	height: 56px;
	font-size: 16px;
	letter-spacing: 1px;
}
.white {
	color: $separ;
}
.bot_text {
	margin-top: 20px;
}
.right {
	overflow: hidden;
	height: 100%;
	max-width: 700px;
	width: 100%;
	background: url('/v/img/logo_big.png') left center;
}
</style>
