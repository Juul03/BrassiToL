<script>
	import Filter from '../components/filter.svelte'
	import Treemapj from '../components/PhylogeneticTree.svelte';
</script>


<!-- <h1>Phylogentic Tree Brassicaceae</h1> -->
<img class="logo" src="/logofull.svg" alt="Brassicaceae tree of life">

<main>
	<Filter/>
	<Treemapj/>
</main>

<style>
	.logo {
		padding:1rem;
		height:4.5rem;
	}
	main {
		display:flex;
		justify-content:space-between;
		/* flex-wrap:wrap; */
	}
</style>


