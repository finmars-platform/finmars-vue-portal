<template>
	<div class="demo-extension-panel-page">
		<FmBtn @click="$router.back" type="icon" icon="chevron_left" />
		<h1>ExtantionPanel</h1>
		<div class="list">
			<FmExpansionPanel />
			<FmExpansionPanel title="Title" />
			<FmExpansionPanel title="Title">
				Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae commodi
				deserunt dolore doloremque maiores nemo nulla perspiciatis praesentium
				provident, sunt tenetur voluptates. Accusantium aliquam aliquid amet
				consequatur consequuntur cum eius eos est explicabo impedit inventore
				libero maiores molestiae necessitatibus nisi non nostrum praesentium,
				provident quas quasi quos ratione recusandae sapiente tenetur veniam.
				Aliquam aperiam atque deserunt eum facere incidunt ipsam modi optio
				placeat quis reiciendis, similique sit tempore tenetur ullam. Amet, cum
				cupiditate, iste nesciunt odit, praesentium quibusdam soluta tempora
				unde ut voluptatibus voluptatum? Ad aliquam cupiditate, dignissimos
				facere impedit magni nam, nisi placeat quisquam temporibus unde voluptas
				voluptatibus! Saepe.
			</FmExpansionPanel>
			<FmExpansionPanel subtitle="Subtitle" title="Title">
				Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae commodi
				deserunt dolore doloremque maiores nemo nulla perspiciatis praesentium
				provident, sunt tenetur voluptates. Accusantium aliquam aliquid amet
				consequatur consequuntur cum eius eos est explicabo impedit inventore
				libero maiores molestiae necessitatibus nisi non nostrum praesentium,
				provident quas quasi quos ratione recusandae sapiente tenetur veniam.
				Aliquam aperiam atque deserunt eum facere incidunt ipsam modi optio
				placeat quis reiciendis, similique sit tempore tenetur ullam. Amet, cum
				cupiditate, iste nesciunt odit, praesentium quibusdam soluta tempora
				unde ut voluptatibus voluptatum? Ad aliquam cupiditate, dignissimos
				facere impedit magni nam, nisi placeat quisquam temporibus unde voluptas
				voluptatibus! Saepe.
			</FmExpansionPanel>
			<FmExpansionPanel
				subtitle="Subtitle"
				subtitleOpen="subtitleOpen"
				:open="false"
				title="Title"
			>
				Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae commodi
				deserunt dolore doloremque maiores nemo nulla perspiciatis praesentium
				provident, sunt tenetur voluptates. Accusantium aliquam aliquid amet
				consequatur consequuntur cum eius eos est explicabo impedit inventore
				libero maiores molestiae necessitatibus nisi non nostrum praesentium,
				provident quas quasi quos ratione recusandae sapiente tenetur veniam.
				Aliquam aperiam atque deserunt eum facere incidunt ipsam modi optio
				placeat quis reiciendis, similique sit tempore tenetur ullam. Amet, cum
				cupiditate, iste nesciunt odit, praesentium quibusdam soluta tempora
				unde ut voluptatibus voluptatum? Ad aliquam cupiditate, dignissimos
				facere impedit magni nam, nisi placeat quisquam temporibus unde voluptas
				voluptatibus! Saepe.
			</FmExpansionPanel>
		</div>
	</div>
</template>

<script setup></script>

<style scoped>
	.demo-extension-panel-page {
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 16px;
		border: 1px solid var(--baseText-color);
		padding: 24px;
	}
</style>
