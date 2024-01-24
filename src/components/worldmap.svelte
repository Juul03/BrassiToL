<script>
    import { redirect } from "@sveltejs/kit";
    import * as d3 from "d3";
    import { onMount } from "svelte";
    import { selectedTaxonomyStore } from "$lib/selectedTaxonomyStore";
    import nodeColorsStore from "$lib/nodeColorsStore";

    let worldmapgeojson = {};
    let selectedTaxonomy = {};
    let allSpeciesData = {};
    let countryCodeToNamejson = {};
    let prevSelectedSpecies = [];
    let prevSelectedGenus = [];

    let nodeColors;

    let worldMapElement;
    let selectedActiveCategory = "native"

    async function fetchgeoJSONData(url) {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            worldmapgeojson = data;
            console.log(worldmapgeojson);
        } else {
            console.error("Failed to fetch the data");
        }
    }

    async function fetchData(url) {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            allSpeciesData = data;
            console.log(allSpeciesData);
        } else {
            console.error("Failed to fetch the data");
        }
    }

    async function fetchCodeData(url) {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            countryCodeToNamejson = data;
            console.log(countryCodeToNamejson);
        } else {
            console.error("Failed to fetch the data");
        }
    }

    let findCorrespondingCountriesAndColor = (value) => {
            selectedTaxonomy = value;
            console.log("selected", selectedTaxonomy);
            let countryCodesArray

            if(selectedTaxonomy.binaryCombination) {
                countryCodesArray = selectedTaxonomy.binaryCombination.map(
                (specie) => {
                    return matchSpecieWithCountryCode(specie, allSpeciesData);
                },
            );
            }
            
            // Call the colorCountry function after the subscription updates the selectedTaxonomy
            if(countryCodesArray) {
                countryCodesArray.forEach(array => {
                colorCountry(array)
            })
            }
        }

    onMount(async () => {
        await fetchgeoJSONData("data/TDWG_level3_map(1).json");
        await fetchData("data/metadataBrassiToL.json");
        await fetchCodeData("data/countryCodeToName.json");

        prevSelectedSpecies = selectedTaxonomy.binaryCombination || [];
        prevSelectedGenus = selectedTaxonomy.genus || [];

        let projection = d3.geoMercator().fitSize([1000, 600], worldmapgeojson);

        let geoGenerator = d3.geoPath().projection(projection);

        let createMap = (worldmapgeojson) => {
            let svg = d3
                .select("#worldmap")
                .attr("width", "1050px")
                .attr("height", "650px")
                .style("padding-top", "10px")
                .style("background-color", "var(--primary-color-dark-2)");
            let u = d3
                .select("#content g.map")
                .selectAll("path")
                .data(worldmapgeojson.features);

            u.enter()
                .append("path")
                .attr("d", geoGenerator)
                .style("fill", "white")
                .style("stroke", "black")
                .style("stroke-width", "0.3px");
        }

        createMap(worldmapgeojson);

        const unsubscribe = selectedTaxonomyStore.subscribe((value) => {
            findCorrespondingCountriesAndColor(value);
        });

        const unsubscribeColors = nodeColorsStore.subscribe(value => {
            nodeColors = value;
            console.log("COLORS", nodeColors)
        })

        worldMapElement = d3.select("#content");

        return () => {
            unsubscribe();
            unsubscribeColors();
        };
    });

    function colorCountry(countryNames) {
        // Reset all countries to the original style
        d3.select("#content g.map").selectAll("path").style("fill", "white");

        // Add the new selected countries and color them
        countryNames.forEach((countryName) => {
            d3.select("#content g.map")
                .selectAll("path")
                .filter((d) => d.properties.LEVEL3_COD === countryName)
                .style("fill", "orange");
        });

        // Remove the fill color for unselected countries
        const unselectedCountryNames = prevSelectedSpecies.filter((name) => !countryNames.includes(name));

        unselectedCountryNames.forEach((countryName) => {
            d3.select("#content g.map")
                .selectAll("path")
                .filter((d) => d.properties.name === countryName)
                .style("fill", "white");
        });

        // Update the previous selected species
        prevSelectedSpecies = countryNames;
    }
    

    let matchSpecieWithCountryCode = (speciename, data) => {
    let countryCodes = [];

    data.forEach((datapoint) => {
            if (datapoint.SPECIES_NAME_PRINT === speciename) {
                if (selectedActiveCategory === "native") {
                    countryCodes.push(datapoint.WCVP_WGSRPD_LEVEL_3_native);

                } else if (selectedActiveCategory === "introduced") {
                    countryCodes.push(datapoint.WCVP_WGSRPD_LEVEL_3_introduced);

                } else if (selectedActiveCategory === "extinct") {
                    countryCodes.push(datapoint.WCVP_WGSRPD_LEVEL_3_extinct);

                }
            }
        });
        
        // Join the array elements into a string and remove square brackets
        let joinedString = countryCodes.join(', ').replace(/[\[\]']+/g, "");
        
        // Split the string into an array
        countryCodes = joinedString.split(", ");
        
        return countryCodes;
    };

    let selectCategory = (category) => {
        // Update selectedActiveCategory
        selectedActiveCategory = category;

        // Remove 'selected' class from all li elements
        document.querySelectorAll("#content nav ul li").forEach((li) => {
            li.classList.remove("selected");
        });

        // Add 'selected' class to the clicked li element
        document.querySelector(`#content nav ul li[data-category="${category}"]`).classList.add("selected");

        // Call the function to update the map based on the selected category
        findCorrespondingCountriesAndColor(selectedTaxonomy);

    }

let showMap = () => {

    console.log("worldmap", worldMapElement)
    worldMapElement.classList.add('show');
}

</script>

<div id="content">
    <nav>
        <ul>
            <li on:click={() => selectCategory("native")} class:selected={selectedActiveCategory === "native"} data-category="native">Native</li>
            <li on:click={() => selectCategory("introduced")} class:selected={selectedActiveCategory === "introduced"} data-category="introduced">Introduced</li>
            <li on:click={() => selectCategory("extinct")} class:selected={selectedActiveCategory === "extinct"} data-category="extinct">Extinct</li>
        </ul>
    </nav>
    <svg id="worldmap">
        <g class="map"></g>
    </svg>
</div>

<style>
    #content > nav {
        position:absolute;
    }

    #content > nav ul {
        position:relative;
        top:.5rem;
        left:1rem;
        background:var(--primary-color-dark-2);
        list-style:none;
        display:flex;
        gap:1rem;
    }

    #content > nav ul li {
        border-radius: var(--standard-border-radius) var(--standard-border-radius) 0 0;
        padding:.5rem;
    }

    #content > nav ul li.selected {
        text-decoration:underline;
        background:var(--primary-color-light-2);
    }
</style>