<script>
	import Filter from '../components/filter.svelte'
	import Treemapj from '../components/test.svelte';
    
</script>

<!-- <h1>Phylogentic Tree Brassicaceae</h1> -->
<header>
	<img class="logo" src="/logofull.svg" alt="Brassicaceae tree of life">
</header>


<main>
	<Filter/>
	<Treemapj/>
</main>

<style>
	header {
		height:10vh;
		width:calc(100vw/3.7);
		background:var(--primary-color-dark-1);
		display:flex;
		align-items:center;

	}

	.logo {
		padding:1rem;
		height:80%;
	}
	main {
		display:flex;
		justify-content:space-between;
		/* flex-wrap:wrap; */
	}
</style>
