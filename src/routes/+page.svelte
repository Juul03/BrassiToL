<script>
    // import Popup from '../components/popup.svelte';
	import PhylogeneticTree from '../components/PhylogeneticTree.svelte';
	import Filter from '../components/filter.svelte'
	import Treemapj from '../components/PhylogeneticTree.svelte';
	import MagnifierButton from '../components/magnifierButton.svelte';
	import Worldmap from '../components/worldmap.svelte'; 
	
	let isWorldmapOpen = false;

	function showWorldMap() {
        const worldMapContainer = document.querySelector('.worldmap-container');
        const worldMapSection = document.querySelector('.worldmap-section');
        const navElement = document.querySelector('#worldmapNav');

		if(isWorldmapOpen == false) {
			worldMapContainer.style.transform = 'translateX(-65vw) rotate(0deg)';
			worldMapSection.style.width = '-65vw';
			worldMapSection.style.zIndex = '1';

			isWorldmapOpen = true
		} else if (isWorldmapOpen == true) {
			worldMapContainer.style.transform = 'translateX(0) rotate(0deg)';
			worldMapSection.style.width = '0';
			worldMapSection.style.zIndex = '1';

			isWorldmapOpen = false;
		}
            
    }

</script>

<header>
	<img class="logo" src="/logofull.svg" alt="Brassicaceae tree of life">

	<p>In co-production with 3rd years students of the minor Information Design at the University of Applied Sciences Amsterdam (2023)</p>
	<p>Designers: Enis Okic and Tamara Schukking. Developers: Donna Baijens and Julia Hoek</p>
	<p>Datacollector: Kasper Hendriks</p>
</header>

<main>
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
</main>

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

	header > p:nth-of-type(1) {
		font-size:.5rem;
		position:fixed;
		top:0;
		right:0;

		padding:1rem;
	}

	header > p:nth-of-type(2) {
		font-size:.5rem;
		position:fixed;
		top:10;
		right:0;

		padding:1rem;
	}

	header > p:nth-of-type(3) {
		font-size:.5rem;
		position:fixed;
		top:0;
		right:0;

		padding:1rem;
		margin-top:1.8rem;
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
