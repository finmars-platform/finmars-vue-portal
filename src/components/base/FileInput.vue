<template>
	<div class="base-input"
			 :class="{'error': errorData, 'disabled': disabled}"
			 tabindex="-1"

			 @click="onBiClick"
	>
		<div class="bi_top">
			<div class="top_left_border"></div>

			<div class="bi_label"
					 v-if="label"
					 :class="{filling: modelValue}"
			>
				{{ label }}
			</div>

			<div class="top_right_border"></div>
		</div>

		<div class="bi_wrap">
			<div class="bi_button">
				<slot name="button"></slot>
			</div>

			<div class="bi_default">
				<slot>
					<input
						ref="mainInput"
						type="file"
						:placeholder="placeholder || label"
						:readonly="readonly"
						:disabled="disabled"

						@input="$emit('update:modelValue', $event.target.value)"
						@focus="$emit('onFocus')"
						@blur="$emit('onBlur')"
						@change="handleFileChange($event)"

						class="bi_main_input"
					/>
				</slot>

<!--				<FmBtn class="file-input-upload-button" @click="$emit('onUpload')">Upload</FmBtn>-->
			</div>

			<div class="bi_side_items flex" :class="{'empty': !tooltip && !$slots.sideItems}">
				<slot name="sideItems"></slot>

				<div class="bi_side_item" v-if="tooltip">
					<FmIcon v-fm-tooltip.error="tooltip" icon="info_outlined"/>
				</div>
			</div>


			<div v-if="errorData && errorData.longMessage"
					 class="bi_side_item error_icon">
				<FmIcon v-fm-tooltip="errorData.longMessage" icon="info"/>
			</div>

			<div class="right_btn">
				<slot name="rightBtn"></slot>
			</div>
		</div>
		<div class="bi_error" v-if="errorData">{{ errorData.message }}</div>
	</div>
</template>

<script setup>

let props = defineProps({
	modelValue: [String, Number],
	type: String,
	label: String,
	placeholder: String,
	readonly: Boolean,
	disabled: Boolean,
	required: Boolean,
	tooltip: String,
	// error: [String, Array]
	errorData: Object,
})

let emit = defineEmits(['update:modelValue', 'update:errorData', 'onBlur', 'onFocus', 'onUpload']);
let mainInput = ref(null);
let selectedFile = ref(null);

defineExpose({
	mainInput
})

let slots = useSlots();

function handleFileChange(event) {

	// console.log('handleFileChange', event);

	selectedFile.value = event.target.files[0];

	emit('onUpload', selectedFile.value);

}

watch(
	() => props.modelValue,
	() => {
		if (props.errorData && props.errorData.code === 30 && props.modelValue) emit('update:errorData', null);
	}
)

if (props.required) {

	watch(
		() => props.errorData ? props.errorData.validate : false,
		(newVal) => {

			if (newVal) {

				const error = props.modelValue ? null : {message: "Field should not be null"};
				emit('update:errorData', error);

			}
		}
	)

}

function onBiClick() {
	if (props.disabled) return;
	if (mainInput.value) mainInput.value.focus();
}

/*function onModelValueChange (newVal) {

	if (props.errorData && props.errorData.code === 10 && newVal) {
		emit('update:errorData', null);
	}

	emit('update:modelValue', newVal);

}*/

</script>

<style lang="scss" scoped>

$input-border: 1px solid $border-darken;
$active-input-border: 1px solid $border-active;
$side-items-padding: 0 8px;
$border-radius: 4px;

%show_label {
	top: -8px;
	width: auto;
	flex-basis: auto;
	padding: 0 3px;
	font-size: 12px;
	visibility: visible;
	opacity: 1;
}

.base-input {
	position: relative;
	display: block;
	height: 42px;
	// border: 1px solid $border-darken;
	border-radius: $border-radius;
	transition: border 0.3s;
	background: var(--dialog-background-color);;

	&.small {
		height: 24px;
		font-size: 14px;
	}

	&:not(.bi_no_margins) {
		margin-bottom: 25px;
	}

	&:not(.bi_no_borders) {
		margin-top: 6px;

		.bi_wrap {
			border: $input-border;
			border-top-color: transparent;
			border-radius: $border-radius;
		}

	}

	&:not(.bi_no_borders):not(.disabled):focus-within,
	&:not(.bi_no_borders):not(.disabled):focus {

		.bi_top {
			.top_left_border, .top_right_border {
				border-top: $active-input-border;
			}

			.bi_label {
				@extend %show_label;
			}
		}

		.bi_wrap {
			border-top-color: transparent !important;
			border-right: $active-input-border;
			border-bottom: $active-input-border;
			border-left: $active-input-border;
		}

	}

	&.bi_no_borders {
		margin-bottom: 0;

		&.bi_border_bottom {

			.bi_default {
				border-bottom: 1px solid $border;
				padding-left: 7px;
				padding-bottom: 3px;
				margin-left: 6px;
				margin-bottom: -3px;
			}
		}

		.bi_top {
			display: none;
		}
	}

	&:hover {
		.bi_side_items:not(.empty) {
			display: flex;
			padding: $side-items-padding;
		}
	}

	&.error:not(.disabled) {
		margin-bottom: 30px;

		.error_icon {
			color: $error;
		}

		.bi_top {

			.bi_label {
				color: $error;
			}

		}

		.bi_button {
			color: $error;

			:deep(.fm_btn.icon .icon) {
				color: $error;
			}
		}
	}

	&.error:not(.disabled):not(.bi_no_borders) {

		.bi_top {
			.top_left_border, .top_right_border {
				border-color: $error;
			}
		}

		.bi_wrap {
			border-right-color: $error;
			border-bottom-color: $error;
			border-left-color: $error;
		}
	}
}

.bi_error {
	color: var(--error-color);
	font-size: 12px;
	// padding: 5px 12px 10px;
	padding: 4px 12px 0;
}

.base-input.disabled {
	color: $text-pale;

	&:not(.bi_no_borders) {

		.top_left_border, .top_right_border {
			border-color: $borer-lighten;
		}

		.bi_wrap {
			border-right-color: $borer-lighten;
			border-bottom-color: $borer-lighten;
			border-left-color: $borer-lighten;
		}
	}

	.bi_main_input {
		color: var(--card-secondary-text-color);
	}
}

.base-input.cursor-pointer {
	.bi_main_input {
		cursor: pointer;
	}
}

.bi_top {
	position: absolute;
	display: flex;
	flex-direction: row;
	width: 100%;
	// top: -1px;
	top: 1px;
	left: 0;
	z-index: 0;

	.top_left_border {
		flex: 0 0 10px;
		width: 10px;
		height: 5px; // makes connection with .base-input borders smoother
		border-top: $input-border;
		border-top-left-radius: $border-radius;
	}

	.bi_label {
		/*position: absolute;
		top: 10px;
		left: 10px;*/
		flex: 1 0 0;
		position: relative;
		top: 0;
		// padding: 0 3px;
		width: 0;
		max-width: 85%;
		z-index: 1;
		color: var(--secondary-color);
		font-size: 16px;
		transition: 0.2s;
		opacity: 0;
		visibility: hidden;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;

		/*&:after {
			content: '';
			display: block;
			position: absolute;
			top: 7px;
			left: 0;
			background: $separ;
			height: 1px;
			width: 100%;
			z-index: -1;
		}*/
		&.filling {
			@extend %show_label;
		}
	}

	.top_right_border {
		flex: 0 3 100%;
		height: 5px; // makes connection with .base-input borders smoother
		border-top: $input-border;
		border-top-right-radius: $border-radius;
	}


}

.bi_wrap {
	display: flex;
	align-items: center;
	// height: 40px;
	// min-height: 42px;
	height: 100%;
	width: 100%;
}

.bi_default {
	flex-grow: 1;
	margin-left: 13px;
	height: inherit;

	/*input {
		width: 100%;
		height: inherit;
	}*/
}

.bi_button {
	margin-left: 13px;
	color: var(--card-secondary-text-color);
	line-height: 0;
	z-index: 1; // keeps .bi_button atop of .bi_top

	&:empty {
		margin-left: 0;
	}
}

.bi_side_items {
	display: none;
	padding: $side-items-padding;
	z-index: 1; // keeps .bi_side_items atop of .bi_top

	&:empty {
		width: auto;
		padding: 0;
	}
}

.right_btn {
	margin-right: 10px;
	color: var(--card-secondary-text-color);

	&:empty {
		margin-right: 0;
	}
}

.bi_side_item {
	width: 24px;
	color: var(--card-secondary-text-color);

	& + & {
		margin-left: 1px;
	}
}
input[type=file] {
	display: block;
	padding-top: 10px;
}

.file-input-upload-button {
	position: absolute;
	right: 4px;
	top: 4px;
}

</style>
