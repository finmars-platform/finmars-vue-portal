<template>
	<BaseInput
		class="file_input"
		:label="label"
		:accept="accept"
		modelValue=" "
		@click="fileInput.click()"
	>
		<template #button>
			<FmIcon icon="file_upload" type="outlined" />
		</template>

		<input ref="fileInput" type="file" @change="addFile" />
		<div class="selected">
			{{ fileName }}
		</div>

		<template #sedeItems></template>
	</BaseInput>
</template>

<script setup>
	let props = defineProps({
		label: String,
		accept: String,
		fileName: String
	})

	let fileName = ref(props.fileName || '...')

	let fileInput = ref(null)

	function addFile(e) {
		let file = e.target.files[0]

		if (!file) return false

		fileName.value =
			file.name.length > 20 ? file.name.slice(0, 25) + '...' : file.name
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
