<template>
	<div class="channels-toolbar">
		<ChannelsToolbarCategory />

		<ChannelsToolbarStatus />

		<ChannelsToolbarDate />

		<FmIconButton icon="mdi-magnify" variant="text" />

		<ChannelsToolbarActions
			:channel="channel"
			@select:action="runSelectAction"
		/>
	</div>
</template>

<script setup>
	import { FmIconButton } from '@finmars/ui';
	import ChannelsToolbarCategory from './ChannelsToolbarCategory.vue';
	import ChannelsToolbarStatus from './ChannelsToolbarStatus.vue';
	import ChannelsToolbarDate from './ChannelsToolbarDate.vue';
	import ChannelsToolbarActions from './ChannelsToolbarActions.vue';

	defineProps({
		channel: {
			type: Object
		}
	});

	const emits = defineEmits(['select:action']);

	function runSelectAction(action) {
		emits('select:action', action);
	}
</script>

<style lang="scss" scoped>
	.channels-toolbar {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		flex-grow: 1;

		:deep(.v-btn) {
			text-transform: none;
		}
	}
</style>
