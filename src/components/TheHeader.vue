<template>
	<FmHeader
		:notifications="noti"
		:isDark="toggleIsDark"
		:currentWorkspaceName="store?.current?.name"
		:workspaces="store?.masterUsers"
		:documentationUrl="getDocumentationLink()"
		:apiReferenceUrl="`${apiUrl}/${store.realm_code}/${store.space_code}/docs/api/v1/`"
		:logoutUrl="`${apiUrl}/logout`"
		:logo="logoPath"
		:avatar="store?.user?.profile_picture"
		:letters="letters"
		@setTheme="toggleTheme"
		@profile="goToProfile"
		@security="openAccManager"
		@setCurrent="setCurrent"
	/>
</template>

<script setup>
	// import formbricks from '@/services/formbricks';

	const store = useStore();
	const config = useRuntimeConfig();
	const apiUrl = config.public.apiURL;
	const { themeSettings, getPrefixPath } = storeToRefs(useWhiteLabelStore());

	const noti = ref(null);
	const toggleIsDark = ref(store?.user?.data?.dark_mode);

	const letters = computed(() => {
		return (
			(store?.user?.first_name || store?.user?.username)?.slice(0, 2) ||
			''
		);
	});
	const logoPath = computed(() => {
		switch (toggleIsDark.value) {
			case true:
				return themeSettings.value?.logo_dark_url
					? getPrefixPath.value + themeSettings.value?.logo_dark_url
					: undefined;
			default:
				return themeSettings.value?.logo_light_url
					? getPrefixPath.value + themeSettings.value?.logo_light_url
					: undefined;
		}
	});

	async function openAccManager() {
		const kc = await uKeycloak();
		kc.accountManagement();
	}

	watchEffect(() => {
		if (store.isUrlValid) {
			loadNoti();
		}
	});

	function goToProfile() {
		window.location.href = '/v/profile';
	}

	async function loadNoti() {
		let res = await useApi('systemMessages.get', {
			filters: { only_new: true }
		});

		if (res._$error) return false;
		noti.value = res.results.filter((item) => !item.is_pinned).slice(0, 3);
	}

	async function setCurrent(item) {
		window.location.href =
			'/' + item.realm_code + '/' + item.space_code + '/a/#!/dashboard';
	}

	function getDocumentationLink() {
		const pieces = window.location.href
			.split('/v/')[1]
			.split('/')
			.map((item) => item.split('-').join(' '));

		return `https://docs.finmars.com/search?term=${pieces.join(' ')}`;
	}

	async function init() {
		// formbricks.setUserId(store.user.id);
		// formbricks.setEmail(store.user.email);
		// await formbricks.registerRouteChange();
	}

	function toggleTheme(val) {

		console.log('val', val);

		if (val !== undefined) {
			toggleIsDark.value = val;
			store.user.data.dark_mode = toggleIsDark.value;

			if (store.user.data.dark_mode) {
				localStorage.setItem("isDarkMode", "true")
			} else {
				localStorage.setItem("isDarkMode", "false")
			}

		} else {
			store.user.data.dark_mode = !store?.user?.data?.dark_mode;

			console.log('store.user.data.dark_mode', store.user.data.dark_mode);

			if (store.user.data.dark_mode) {
				localStorage.setItem("isDarkMode", "true")
			} else {
				localStorage.setItem("isDarkMode", "false")
			}
		}



		// updateUser();
	}

	const updateUser = function () {
		const options = {
			params: { id: store.user.id },
			body: store.user
		};

		useApi('user.put', options);
	};

	init();
</script>

<style lang="scss" scoped></style>
