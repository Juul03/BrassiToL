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

    let nodeColors;

    let worldMapElement;

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

    onMount(async () => {
        await fetchgeoJSONData("data/worldmapl2.geojson");
        await fetchData("data/metadataBrassiToL.json");
        await fetchCodeData("data/countryCodeToName.json");

        prevSelectedSpecies = selectedTaxonomy.binaryCombination || [];

        // matchSpecieWithCountry("Arabis scabra", allSpeciesData);
        // selectedTaxonomy.binaryCombination.forEach((specie) => {
        //     matchSpecieWithCountry(specie, allSpeciesData);
        // });

        let projection = d3.geoMercator().fitSize([1000, 600], worldmapgeojson);

        let geoGenerator = d3.geoPath().projection(projection);

        function createMap(worldmapgeojson) {
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
            selectedTaxonomy = value;
            console.log("selected", selectedTaxonomy);

            let countryCodesArray = selectedTaxonomy.binaryCombination.map(
                (specie) => {
                    return matchSpecieWithCountryCode(specie, allSpeciesData);
                },
            );

            let countryNamesArray = countryCodesArray.map((country) => {
                return matchCountryCodeWithCountryName(country, countryCodeToNamejson
                );
            });

            console.log("worst", countryNamesArray);

            // Call the colorCountry function after the subscription updates the selectedTaxonomy
            countryNamesArray.forEach(array => {
                colorCountry(array)
            })
            // colorCountry(countryNamesArray);
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
        console.log('kaas+worst', countryNames);

        // Reset all countries to the original style
        d3.select("#content g.map").selectAll("path").style("fill", "white");

        // Add the new selected countries and color them
        countryNames.forEach((countryName) => {
            d3.select("#content g.map")
                .selectAll("path")
                .filter((d) => d.properties.name === countryName)
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
            countryCodes.push(datapoint.WCVP_WGSRPD_LEVEL_3_native);
        }
    });

    console.log(countryCodes);
    
    // Join the array elements into a string and remove square brackets
    let joinedString = countryCodes.join(', ').replace(/[\[\]']+/g, "");
    
    // Split the string into an array
    countryCodes = joinedString.split(", ");
    
    console.log("kaas", countryCodes);
    return countryCodes;
};


let matchCountryCodeWithCountryName = (codes, data) => {
    console.log("hoi", codes);
    const countryNames = [];

    codes.forEach((code) => {
        data.forEach((datapoint) => {
            if (datapoint.Code === code) {
                countryNames.push(datapoint.WGSRPD_name);
            }
        });
    });

    console.log("kaas", countryNames);
    return countryNames;
};

let showMap = () => {

    console.log("worldmap", worldMapElement)
    worldMapElement.classList.add('show');
}

</script>

<div id="content">
    <svg id="worldmap">
        <g class="map"></g>
    </svg>
</div>

<style>
    #content {
        /* transform:translate(126%); */
        /* position:absolute;
        top:7.35%; */
        /* display:none; */
        /* z-index:100; */
    }
</style>