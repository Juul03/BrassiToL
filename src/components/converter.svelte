<script>
    import { onMount } from 'svelte';
  
    async function fetchGeoJSONData(url) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json(); 
          return data;
        } else {
          console.error('Failed to fetch the data');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  
    onMount(async () => {
      try {
        const getData = await fetchGeoJSONData('/data/test.geoJson');
        console.log("getData", getData)

        // Create a GeoJSON feature collection
        const geojson = {
        type: 'FeatureCollection',
        features: [],
        };

        // Iterate through the data arrays and create features
        for (let i = 0; i < getData.LEVEL1_COD.length; i++) {
        const feature = {
            type: 'Feature',
                geometry: {
                type: 'Point', // Assuming the geometry type is Point, adjust accordingly
                coordinates: getData.geometry[i],
            },
            properties: {
                LEVEL1_COD: getData.LEVEL1_COD[i],
                LEVEL2_COD: getData.LEVEL2_COD[i],
                LEVEL3_COD: getData.LEVEL3_COD[i],
                LEVEL3_NAM: getData.LEVEL3_NAM[i],
            },
        };

        geojson.features.push(feature);
        console.log("geo", geojson)
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    });
  </script>
  