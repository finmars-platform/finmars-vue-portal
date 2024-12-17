<template>
	<div
		:class="['fm-input-files', { 'fm-input-files--disabled': disabled }]"
		@dragenter="onDragenter"
		@dragleave="onDragleave"
	>
		<div
			:class="[
				'fm-input-files__dropzone',
				{
					'fm-input-files__dropzone--accented':
						isOverDropPlace || isOverDropZone
				}
			]"
			@dragenter="onDropzoneDragenter"
			@dragover="onDropzoneDragover"
			@dragleave="onDropzoneDragleave"
			@drop="onDrop"
		>
			<div class="fm-input-files__dropzone-border" />

			<h3 class="fm-input-files__dropzone-title">
				{{ infoTitle }}
			</h3>

			<label
				:id="id"
				class="fm-input-files__label"
				v-on="disabled ? {} : { click: selectFiles }"
			>
				<FmIcon
					icon="mdi-upload"
					size="80"
					:color="
						isOverDropPlace || isOverDropZone
							? 'var(--primary)'
							: 'var(--on-surface)'
					"
				/>

				{{ selectedButtonText }}
			</label>

			<div v-if="infoText" class="fm-input-files__dropzone-text">
				{{ infoText }}
			</div>
		</div>

		<input
			:id="id"
			ref="fileInput"
			type="file"
			name="file"
			hidden
			:multiple="multiple"
			:accept="allowedFileTypes"
			@change="onChange"
		/>
	</div>
</template>

<script setup>
	import { computed, ref } from 'vue';
	import last from 'lodash/last';
	import size from 'lodash/size';
	import trim from 'lodash/trim';
	import { FmIcon, getRandomString, formatFileSize } from '@finmars/ui';

	const props = defineProps({
		modelValue: {
			type: Array // File[]
		},
		selectedButtonText: {
			type: String,
			default: 'Select file'
		},
		infoTitle: {
			type: String,
			default: 'Drag and drop the file or select it'
		},
		infoText: {
			type: String
		},
		multiple: {
			type: Boolean
		},
		maxNumberOfFiles: {
			type: [Number, String]
		},
		maxFileSize: {
			type: Number
		},
		allowedFileTypes: {
			type: String,
			default: '*'
		},
		width: {
			type: [Number, String],
			default: '100%'
		},
		height: {
			type: [Number, String],
			default: '100%'
		},
		disabled: {
			type: Boolean
		}
	});

	const emits = defineEmits(['update:modelValue', 'error']);

	const id = ref(getRandomString(4));
	const fileInput = ref();
	const isOverDropPlace = ref(false);
	const isOverDropZone = ref(false);

	const widthValue = computed(() =>
		['100%', 'auto'].includes(props.width) ? props.width : `${props.width}px`
	);
	const heightValue = computed(() =>
		['100%', 'auto'].includes(props.height) ? props.height : `${props.height}px`
	);

	function selectFiles(ev) {
		ev.stopImmediatePropagation();
		fileInput.value.click();
	}

	function validateFileSize(file) {
		if (!file) {
			return false;
		}

		if (!props.maxFileSize) {
			return true;
		}

		const { name, size } = file;
		if (size > props.maxFileSize) {
			emits(
				'error',
				`The [${name}] file is too big. Maximum file size ${formatFileSize(props.maxFileSize)}`
			);
			return false;
		}
		return true;
	}

	function validateFileType(file) {
		if (!file) {
			return false;
		}

		const { name } = file;
		const fileExt = `.${last(name.split('.'))}`.toLowerCase();
		const allowedFileTypes = props.allowedFileTypes
			.split(',')
			.map((type) => trim(type).toLowerCase());

		const isValid =
			allowedFileTypes.includes('*') || allowedFileTypes.includes(fileExt);
		if (!isValid) {
			emits('error', `The [${name}] file type is not valid.`);
		}
		return isValid;
	}

	function validateDuplicateFile(file) {
		if (!file) {
			return false;
		}

		const { name } = file;
		const isFoundDuplicate = props.modelValue.find(
			(file) => file.name === name
		);

		if (isFoundDuplicate) {
			emits('error', `The [${name}] file has already been downloaded.`);
		}

		return !isFoundDuplicate;
	}

	function validateCount(files = []) {
		if (!props.maxNumberOfFiles) {
			return true;
		}

		const total = files.reduce((acc, file) => {
			const { size } = file;
			if (size) {
				acc += size;
			}
			return acc;
		}, 0);

		const isValid = total <= Number(props.maxNumberOfFiles);
		if (!isValid) {
			emits(
				'error',
				`You cannot select more than ${props.maxNumberOfFiles} files.`
			);
		}
		return isValid;
	}

	function processFiles(files) {
		if (size(files)) {
			if (!validateCount(files)) {
				return;
			}

			const inputValue = files
				.filter((f) => validateDuplicateFile(f))
				.filter((f) => validateFileSize(f))
				.filter((f) => validateFileType(f));

			if (size(inputValue) > 0) {
				emits('update:modelValue', [...props.modelValue, ...inputValue]);
			}
		}
	}

	function onDragenter(ev) {
		if (props.disabled) {
			return;
		}

		ev.preventDefault();
		isOverDropPlace.value = true;
	}

	function onDragleave(ev) {
		if (props.disabled) {
			return;
		}

		ev.preventDefault();
		isOverDropPlace.value = false;
	}

	function onDropzoneDragover(ev) {
		if (props.disabled) {
			return;
		}

		ev.stopPropagation();
		ev.preventDefault();
	}

	function onDropzoneDragenter(ev) {
		if (props.disabled) {
			return;
		}

		ev.preventDefault();
		isOverDropZone.value = true;
	}

	function onDropzoneDragleave(ev) {
		if (props.disabled) {
			return;
		}

		ev.preventDefault();
		isOverDropZone.value = false;
	}

	function onDrop(ev) {
		if (props.disabled) {
			return;
		}

		ev.stopPropagation();
		ev.preventDefault();
		size(ev.dataTransfer?.files) && processFiles([...ev.dataTransfer.files]);
		isOverDropPlace.value = false;
		isOverDropZone.value = false;
	}

	function onChange() {
		processFiles([...fileInput.value.files]);
		fileInput.value.value = '';
	}
</script>

<style lang="scss" scoped>
	.fm-input-files {
		--fmInputFiles-width: v-bind(widthValue);
		--fmInputFiles-height: v-bind(heightValue);
		--fmInputFiles-bg: transparent;
		--fmInputFiles-border-radius: 16px;

		position: relative;
		width: var(--fmInputFiles-width);
		height: var(--fmInputFiles-height);
		border-radius: var(--fmInputFiles-border-radius);
		background-color: var(--fmInputFiles-bg);

		&__dropzone {
			box-sizing: border-box;
			position: absolute;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			row-gap: 16px;
			inset: 4px 4px;
			border-radius: var(--fmInputFiles-border-radius);
			z-index: 5;
			color: var(--on-surface);
			user-select: none;

			&-title {
				font-size: 18px;
				font-weight: 600;
				line-height: 24px;
				pointer-events: none;
			}

			&-text {
				font-size: 14px;
				font-weight: 400;
				line-height: 18px;
				pointer-events: none;
			}

			&--accented {
				color: var(--primary);

				.fm-input-files__dropzone-border {
					border: 2px var(--primary) dashed;
				}
			}
		}

		&__dropzone-border {
			box-sizing: border-box;
			position: absolute;
			top: 9px;
			bottom: 9px;
			left: 9px;
			right: 9px;
			border-radius: var(--fmInputFiles-border-radius);
			border: 2px var(--outline) dashed;
			pointer-events: none;
		}

		&__label {
			display: flex;
			width: 120px;
			height: 120px;
			border-radius: 4px;
			border: 1px solid var(--outline);
			flex-direction: column;
			justify-content: center;
			align-items: center;
			font-size: 18px;
			cursor: pointer;

			&:hover {
				background-color: color-mix(in srgb, var(--on-surface) 8%, transparent);
			}
		}

		&--disabled {
			pointer-events: none;
			cursor: default;
			opacity: 0.75;
		}
	}
</style>
