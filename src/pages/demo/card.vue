<template>
	<div class="card-button-page">
		<FmBtn @click="$router.back" type="icon" icon="chevron_left" />
		<h1>Card</h1>
		<div class="list">
			<FmCard></FmCard>
			<FmCard>
				Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet
				consequatur cum dolore dolores dolorum eligendi enim excepturi
				exercitationem facere hic magnam minima molestiae nam nemo nulla
				perferendis porro possimus provident quas quasi quidem, quo reiciendis
				repellat repellendus repudiandae rerum sapiente sequi sunt tempora
				veritatis. Architecto cum deleniti dolor explicabo impedit ipsa quam,
				unde veritatis vitae. Adipisci distinctio ex ipsam labore optio soluta,
				voluptatibus. Cumque, distinctio minus nihil qui repudiandae sequi
				voluptatem? Accusantium alias animi aspernatur dignissimos eum facere
				fugiat, laborum rem repudiandae sit vel vero voluptates voluptatum? Amet
				beatae, cupiditate, dignissimos eligendi facilis impedit quasi,
				quibusdam sapiente suscipit temporibus vel.
			</FmCard>
			<FmCard title="Title">
				Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet
				consequatur cum dolore dolores dolorum eligendi enim excepturi
				exercitationem facere hic magnam minima molestiae nam nemo nulla
				perferendis porro possimus provident quas quasi quidem, quo reiciendis
				repellat repellendus repudiandae rerum sapiente sequi sunt tempora
				veritatis. Architecto cum deleniti dolor explicabo impedit ipsa quam,
				unde veritatis vitae. Adipisci distinctio ex ipsam labore optio soluta,
				voluptatibus. Cumque, distinctio minus nihil qui repudiandae sequi
				voluptatem? Accusantium alias animi aspernatur dignissimos eum facere
				fugiat, laborum rem repudiandae sit vel vero voluptates voluptatum? Amet
				beatae, cupiditate, dignissimos eligendi facilis impedit quasi,
				quibusdam sapiente suscipit temporibus vel.
			</FmCard>
			<FmCard title="Title" :controls="false">
				Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet
				consequatur cum dolore dolores dolorum eligendi enim excepturi
				exercitationem facere hic magnam minima molestiae nam nemo nulla
				perferendis porro possimus provident quas quasi quidem, quo reiciendis
				repellat repellendus repudiandae rerum sapiente sequi sunt tempora
				veritatis. Architecto cum deleniti dolor explicabo impedit ipsa quam,
				unde veritatis vitae. Adipisci distinctio ex ipsam labore optio soluta,
				voluptatibus. Cumque, distinctio minus nihil qui repudiandae sequi
				voluptatem? Accusantium alias animi aspernatur dignissimos eum facere
				fugiat, laborum rem repudiandae sit vel vero voluptates voluptatum? Amet
				beatae, cupiditate, dignissimos eligendi facilis impedit quasi,
				quibusdam sapiente suscipit temporibus vel.
			</FmCard>
			<FmCard title="Title" :controls="true">
				Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet
				consequatur cum dolore dolores dolorum eligendi enim excepturi
				exercitationem facere hic magnam minima molestiae nam nemo nulla
				perferendis porro possimus provident quas quasi quidem, quo reiciendis
				repellat repellendus repudiandae rerum sapiente sequi sunt tempora
				veritatis. Architecto cum deleniti dolor explicabo impedit ipsa quam,
				unde veritatis vitae. Adipisci distinctio ex ipsam labore optio soluta,
				voluptatibus. Cumque, distinctio minus nihil qui repudiandae sequi
				voluptatem? Accusantium alias animi aspernatur dignissimos eum facere
				fugiat, laborum rem repudiandae sit vel vero voluptates voluptatum? Amet
				beatae, cupiditate, dignissimos eligendi facilis impedit quasi,
				quibusdam sapiente suscipit temporibus vel.
			</FmCard>
			<FmCard title="Title" :controls="false">
				<template #controls>
					<FmBtn type="action"> action</FmBtn>

					<FmBtn type="action"> action</FmBtn>
				</template>
				Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet
				consequatur cum dolore dolores dolorum eligendi enim excepturi
				exercitationem facere hic magnam minima molestiae nam nemo nulla
				perferendis porro possimus provident quas quasi quidem, quo reiciendis
				repellat repellendus repudiandae rerum sapiente sequi sunt tempora
				veritatis. Architecto cum deleniti dolor explicabo impedit ipsa quam,
				unde veritatis vitae. Adipisci distinctio ex ipsam labore optio soluta,
				voluptatibus. Cumque, distinctio minus nihil qui repudiandae sequi
				voluptatem? Accusantium alias animi aspernatur dignissimos eum facere
				fugiat, laborum rem repudiandae sit vel vero voluptates voluptatum? Amet
				beatae, cupiditate, dignissimos eligendi facilis impedit quasi,
				quibusdam sapiente suscipit temporibus vel.
			</FmCard>
			<FmCard title="Title" :controls="true">
				<template #controls>
					<FmBtn type="action"> action</FmBtn>

					<FmBtn type="action"> action</FmBtn>
				</template>
				Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet
				consequatur cum dolore dolores dolorum eligendi enim excepturi
				exercitationem facere hic magnam minima molestiae nam nemo nulla
				perferendis porro possimus provident quas quasi quidem, quo reiciendis
				repellat repellendus repudiandae rerum sapiente sequi sunt tempora
				veritatis. Architecto cum deleniti dolor explicabo impedit ipsa quam,
				unde veritatis vitae. Adipisci distinctio ex ipsam labore optio soluta,
				voluptatibus. Cumque, distinctio minus nihil qui repudiandae sequi
				voluptatem? Accusantium alias animi aspernatur dignissimos eum facere
				fugiat, laborum rem repudiandae sit vel vero voluptates voluptatum? Amet
				beatae, cupiditate, dignissimos eligendi facilis impedit quasi,
				quibusdam sapiente suscipit temporibus vel.
			</FmCard>
		</div>
	</div>
</template>

<script setup></script>

<style scoped>
	.card-button-page {
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 16px;
		border: 1px solid var(--baseText-color);
		padding: 24px;
	}
</style>
