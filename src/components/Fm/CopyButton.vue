<template>
	<button class="copy-button" @click="handleClick" :class="{ 'clicked': isClicked }">
		<FmIcon icon="content_copy" />
	</button>
</template>

<script setup>

import { ref, getCurrentInstance } from 'vue';

const props = defineProps({
	text: String
})

const isClicked = ref(false);

const appInstance = getCurrentInstance().appContext.config.globalProperties;


const handleClick = () => {
	appInstance.$copyToClipboard(props.text);
	isClicked.value = true;
	setTimeout(() => {
		isClicked.value = false;
	}, 300); // Reset after 300ms (duration of the animation)
};

</script>

<style lang="scss" scoped>
.copy-button {
	margin-top: 0;
	background: transparent;
	transition: background-color 0.3s;
	padding: 4px;

	&.clicked {
		background-color: rgba(240, 90, 34, 0.12); // Example color, change as needed
		// Add any other styles or animations you want on click
	}
}
</style>
