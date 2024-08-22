<template>
	<NuxtLink class="logo" :to="useGetNuxtLink('/home', $route.params)">
		<img :src="logoPath" alt="Finmars logo" />
	</NuxtLink>
</template>

<script setup>
	import { useGetNuxtLink } from '~/composables/useMeta'

	const store = useStore()
	const { themeSettings } = storeToRefs(useWhiteLabelStore())

	const logoPath = computed(() => {
		switch (store.darkModeActive) {
			case true:
				return themeSettings.value?.logo_dark_url || '/img/logo-dark.png'
			default:
				return themeSettings.value?.logo_light_url || '/img/logo.png'
		}
	})
</script>

<style lang="scss" scoped>
	.logo {
		img {
			max-width: 140px;
			width: 140px;
			height: 40px;
			margin: 0 auto;
		}
	}
</style>
