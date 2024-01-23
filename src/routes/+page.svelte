<script>
    // import Popup from '../components/popup.svelte';
	// import PhylogeneticTree from '../components/PhylogeneticTree.svelte';
	// import Filter from '../components/filter.svelte'
	// import Treemapj from '../components/PhylogeneticTree.svelte';
	// import MagnifierButton from '../components/MagnifierButton.svelte';
	import Worldmap from '../components/worldmap2.svelte'; 
	import Converter from '../components/converter.svelte' 

	function showWorldMap() {
        const worldMapContainer = document.querySelector('.worldmap-container');
        const worldMapSection = document.querySelector('.worldmap-section');
        const navElement = document.querySelector('#worldmapNav');
        
        worldMapContainer.style.transform = 'translateX(-65vw) rotate(0deg)';
        worldMapSection.style.width = '-65vw';
        worldMapSection.style.zIndex = '1';
    }

</script>

<header>
	<img class="logo" src="/logofull.svg" alt="Brassicaceae tree of life">
</header>

<!-- <Converter/> -->
<Worldmap/>

<!-- <main>
	<Filter/>
	<Treemapj/>
	<MagnifierButton/>

	<div class="worldmap-container">
		<nav id="worldmapNav" on:click="{showWorldMap}">
			<ul>
				<li><img src="/icons/arrowIcon.svg" alt="openmap" />Map</li>
			</ul>
		</nav>

		<section class="worldmap-section">
			<Worldmap/>
		</section>
	</div>
</main> -->

<style>
	header {
		height: 10vh;
		width: calc(100vw / 3.7);
		background: var(--primary-color-dark-1);
		display: flex;
		align-items: center;
	}

	.logo {
		padding: 1rem;
		height: 80%;
	}

	main {
		display: flex;
		justify-content: space-between;
	}

	.worldmap-container {
		display: flex;
		transition: transform 0.5s ease;
	}

	.worldmap-section {
		width: 0;
		transition: width 0.5s ease, z-index 0.5s; /* Add transition for smooth animation */
		position: absolute;
		top: 0;
		right: 0;
		height: 100vh; 
		z-index: -1;
	}

	nav {
        background: var(--primary-color-light-2);
        height: 2rem;
        padding: 0.5rem;
        border-radius: var(--standard-border-radius) var(--standard-border-radius) 0 0;
        transform: rotate(-90deg) translateY(50%) translateX(-20%);
        transition: var(--standard-transition-time);
    }

    nav:hover {
        cursor: pointer;
        background: var(--primary-color-dark-1);
    }

    nav ul {
        display: flex;
        list-style: none;
        padding: 0.25rem;
    }

    nav ul li {
        transform: rotate(180deg);
        display: flex;
        gap: 0.7rem;
    }

    nav:hover ul li img {
        transform: rotate(90deg);
    }

    nav ul li img {
        transform: rotate(-90deg);
        transition: var(--standard-transition-time);
    }
</style>
