<template>
	<BaseInput class="file_input"
		:label="label"
		modelValue=" "
	>
		<template #button>
			<FmIcon
				icon="file_upload"
				type="outlined"
			/>
		</template>

		<input type="file" @change="addFile">
		<div class="selected">
			{{ fileName }}
		</div>

		<template #sedeItems></template>
	</BaseInput>
</template>

<script setup>
	let props = defineProps({
		label: String,
	})

	let fileName = ref('...')

	function addFile( e ) {
		let file = e.target.files[0]

		if ( !file ) return false

		fileName.value = file.name.length > 20 ? file.name.slice(0, 25) + '...' : file.name
	}
</script>

<style lang="scss" scoped>
.file_input {
	cursor: pointer;
}
.selected {
	height: 100%;
	line-height: 40px;
}
</style>
