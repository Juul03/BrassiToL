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
  // Iterate through each feature
  worldmap.features.forEach(feature => {
    // Extract the coordinates array
    const coordinates = feature.geometry.coordinates[0][0]; // Adjusted this line

    // Modify the structure by removing the unnecessary nesting
    feature.geometry.coordinates = coordinates.map(coord => [coord[0], coord[1]]);
  });

  const features = worldmap.features;
  console.log(features);

  // Extract the bounding box of the features
  const bbox = d3.geoBounds({ type: "FeatureCollection", features });

  // Use a basic projection setup with manual extent
  const projection = d3.geoMercator()
    .fitExtent([[0, 0], [1000, 600]], bbox);

  // Create a path generator
  const path = d3.geoPath().projection(projection);

  const svg = d3.select("#worldmap")
    .attr("width", 1000)
    .attr("height", 600);

  // Draw the map
  svg.selectAll("path")
    .data(features)
    .enter()
    .append("path")
    .attr("d", path) // Use the path generator
    .attr("stroke", "black")
    .attr("fill", "gray");
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
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      createMap(geojsonConvertedRightFormat);
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
