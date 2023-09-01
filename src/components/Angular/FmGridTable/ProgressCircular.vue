<template>
	<div class="progress progress-circular progress-size-{{diameter}} front-line-{{frontLineColor}} back-line-{{backLineColor}}"></div>
</template>

<script>

export default function () {
	const props = defineProps([
		'diameter',
		'frontLineColor',
		'backLineColor'
	])
	// return {
	//
	// 	template:
	// 		'',
		// link: function (scope, elem) {
			if (!scope.frontLineColor) {
				scope.frontLineColor = 'default'
			}

			if (!scope.backLineColor) {
				scope.backLineColor = 'default'
			}

			if (!scope.diameter) {
				scope.diameter = 10
			}
// 		},
// 	}
}

</script>

<style lang="scss" scoped>

</style>
