<script>
    import { redirect } from "@sveltejs/kit";
    import * as d3 from "d3";
    import { onMount } from "svelte";

    let worldmapgeojson = {};

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

    onMount(async () => {
        await fetchgeoJSONData("data/worldmapl2.geojson");

        let projection = d3
            // .geoEquirectangular()
            // .scale(200)
            //   .translate([200, 150]);
            .geoMercator().fitSize([1000, 600], worldmapgeojson)
            

        let geoGenerator = d3.geoPath().projection(projection);

        function createMap(worldmapgeojson) {
            let svg = d3.select('svg')
            .attr('width', '1050px')
            .attr('height', '650px')
            .style('background-color', 'blue')
            .attr('transform', 'translate(200, 20)')
            let u = d3
                .select("#content g.map")
                .selectAll("path")
                .data(worldmapgeojson.features)
                

            u.enter()
                .append("path")
                .attr("d", geoGenerator)
                .style("fill", "green")
                .style("stroke", "white")
                .style("stroke-width", "0.5px")

        }

        createMap(worldmapgeojson);
    });
</script>

<div id="content">
    <svg>
        <g class="map"></g>
    </svg>
</div>
