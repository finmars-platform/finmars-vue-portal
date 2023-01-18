<template>
	<Teleport to="body" v-if="modelValue">
		<transition name="fade">
			<div class="modal_wrap flex aic jcc"
				:class="{no_padding: no_padding}"
				v-show="modelValue"
			>
				<div class="modal">
					<div class="modal_top flex aic sb">
						<div class="modal_head">{{ title }}</div>
<!--						<FmIcon :disabled="closingDisabled" icon="close" @click="cancel"/>-->
						<FmBtn :disabled="closingDisabled" type="iconBtn" icon="close" @click="cancel" />
					</div>

					<div class="modal_content scrollable">
						<slot />
					</div>

					<div class="modal_bottom">
						<slot name="controls">
							<div class="flex sb" v-if="controls">
								<FmBtn type="text"
									@click="cancel(), controls.cancel.cb ? controls.cancel.cb() : ''">{{ controls.cancel.name }}</FmBtn>
								<FmBtn @click="cancel(), controls.action.cb()">{{ controls.action.name }}</FmBtn>
							</div>
						</slot>
					</div>
				</div>
				<div class="mask" @[backdropClickable]="cancel"></div>
			</div>
		</transition>
	</Teleport>
</template>

<script>

export default {

  props: {
		modelValue: Boolean,
		title: String,
		// {
		//	cancel:
		//  action
		// }
		controls: Object,
		no_padding: Boolean,
		closeOnClickOutside: {
			type: Boolean,
			default: false
		},
		closingDisabled: Boolean
	},
	emits: [
		'update:modelValue',
		'close'
	],
  data() {
    return {

    }
  },
	computed: {
		backdropClickable() {
			return this.closeOnClickOutside ? 'click' : false;
		}
	},
  async mounted() {
  },
	watch: {
		modelValue(val) {
			if ( val ) document.querySelector('html').style.overflow = 'hidden'
			else document.querySelector('html').style.overflow = 'initial'
		}
	},

  methods: {
    cancel() {
			if (this.closingDisabled) return;
      this.$emit('update:modelValue', false)
      this.$emit('close')
    },
  }
}
</script>

<style lang="scss" scoped>
	.modal_wrap {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: $backdrop-z-index;
		background: rgba(0, 0, 0, 0.55);

		.mask {
			position: absolute;
			top: 0;
			right: 0;
			left: 0;
			bottom: 0;
			z-index: 1;
		}
		&.no_padding {
			.modal_content {
				padding: 0;
			}
		}
	}
	.modal_top {
		height: 50px;
		padding: 0 20px;
		border-bottom: 1px solid $border;
	}
	.modal_content {
		overflow: auto;
		max-height: calc(90vh - 110px);
		padding: 15px 20px 0;
		min-width: 400px; // so that FmInputEntityNames could fit in
	}
	.modal_bottom {
		border-top: 1px solid $border;
		padding: 10px 20px;
	}
	.modal {
		position: relative;
		background: #fff;
		min-width: 300px;
		max-width: 90%;
		border-radius: 4px;
		z-index: 2;

		.close {
			cursor: pointer;

			path {
				transition: 0.3s;
			}

			&:hover path {
				stroke: $primary !important;
			}
		}

		&_head {
			font-weight: 500;
			font-size: 20px;
		}
	}

	@media screen and (max-width: 768px) {
		.modal {
			width: 100%;
			height: 100%;
			max-height: 100%;
		}
	}

	.nopadding .modal {
		padding-left: 0;
		padding-right: 0;
	}
	.fade-enter-active, .fade-leave-active {
		transition: opacity .3s;
	}
	.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
		opacity: 0;
	}
</style>
