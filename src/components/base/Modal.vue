<template>
	<Teleport to="body" v-if="modelValue">
		<transition name="fade">
			<div class="modal_wrap flex aic jcc"
				:class="{no_padding: no_padding}"
				v-show="modelValue"
			>
				<div class="modal">
					<div class="modal_top flex aic sb">
						<div class="modal_head" v-if="title">{{ title }}</div>
<!--						<svg class="close stroke" width="24" height="24" viewBox="0 0 24 24" fill="none"
							xmlns="http://www.w3.org/2000/svg"
							@click="cancel()">
							<path d="M18 6L6 18" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M6 6L18 18" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>-->
						<FmIcon icon="close" @click="cancel"/>
					</div>

					<div class="modal_content scrollable">
						<slot />
					</div>

					<div class="modal_bottom">
						<slot name="controls"></slot>
					</div>
				</div>
				<div class="mask" @click="cancel"></div>
			</div>
		</transition>
	</Teleport>
</template>

<script>

export default {

  props: {
		modelValue: Boolean,
		title: String,
		no_padding: Boolean
	},
	emits: [
		'update:modelValue',
	],
  data() {
    return {

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
      this.$emit('update:modelValue', false)
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
		// border-bottom: 1px solid $border;
	}
	.modal_content {
		overflow: auto;
		max-height: calc(90vh - 110px);
		padding: 15px 20px 0;
		min-width: 360px;
	}
	.modal_bottom {
		// border-top: 1px solid $border;
		padding: 10px 20px;
	}
	.modal {
		position: relative;
		background: #fff;
		min-width: 300px;
		max-width: 90%;
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
