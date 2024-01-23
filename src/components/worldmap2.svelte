<script>
    import { onMount } from "svelte";
    import * as d3 from "d3";
  
    let worldmapgeojson = {};
    let geojsonConvertedRightFormat;
  
    async function fetchGeoJSONData(url) {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        worldmapgeojson = data;
        console.log(worldmapgeojson);
      } else {
        console.error("Failed to fetch the data");
      }
    }
  
    function createMap(worldmap) {
      // Use a basic projection setup
      let projection = d3.geoMercator().fitSize([1000, 600], worldmap);
  
      let geoGenerator = d3.geoPath().projection(projection);
  
      // Select the SVG element
      let svg = d3
        .select("#worldmap")
        .attr("width", "1050px")
        .attr("height", "650px")
        .style("padding-top", "10px")
        .style("background-color", "var(--primary-color-dark-2)");
  
      // Select the map group and bind data
      let u = svg
        .select("#content g.map")
        .selectAll("path")
        .data(worldmap.features);
  
      // Enter new data and append path elements
      u.enter()
        .append("path")
        .attr("d", geoGenerator)
        .style("fill", "white")
        .style("stroke", "black")
        .style("stroke-width", "0.3px");
    }
  
    onMount(async () => {
      try {
        await fetchGeoJSONData('/data/test.json');
        console.log("worldmapgeojson", worldmapgeojson);
  
        geojsonConvertedRightFormat = {
          type: 'FeatureCollection',
          features: worldmapgeojson.geometry.map((coordinates, i) => ({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: coordinates,
            },
            properties: {
              LEVEL1_COD: worldmapgeojson.LEVEL1_COD[i],
              LEVEL2_COD: worldmapgeojson.LEVEL2_COD[i],
              LEVEL3_COD: worldmapgeojson.LEVEL3_COD[i],
              LEVEL3_NAM: worldmapgeojson.LEVEL3_NAM[i],
            },
          })),
        };
  
        createMap(geojsonConvertedRightFormat);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
  
      console.log("right format", geojsonConvertedRightFormat);
    });
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
