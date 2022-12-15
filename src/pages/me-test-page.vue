<template>
	<div>
		<iframe id="dashboardMatrixComponent"
						title="dashboard matrix"
						height="100%"
						width="100%"

						:src="`https://dev.finmars.com/build/556/#!/dashboard-component-rv-matrix?iframe=true&componentId=9b06c5a21adc8965964f22c100efe058&reportLayoutId=132&atoken=${token}`"></iframe>
	</div>
</template>

<script setup>
definePageMeta({
	layout: "auth",
	title: "Finmars | Login",
});

let token = useCookie('access_token').value;

</script>

<style lang="scss" scoped>

</style>
