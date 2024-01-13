<script>
  import { redirect } from "@sveltejs/kit";
  import { onMount } from "svelte";
  import {
    selectedFamiliesStore,
    updateSelectedFamilies,
  } from "$lib/selectedFamiliesStore";

  let metaData = [];
  let uniqueFamilies = [];
  let uniqueSubFamilies = [];
  let uniqueSupertribes = [];
  let uniqueTribes = [];
  let uniqueGenus = [];
  let uniqueSpecies = [];
  let uniqueBinaryCombination = [];

  const fetchJSONData = async () => {
    try {
      const response = await fetch("/data/metadataBrassiToL.json");
      if (response.ok) {
        const data = await response.json();
        metaData = data;

        // Find all unique taxonomy and store them in variables
        uniqueFamilies = findUniqueValues("FAMILY");
        console.log("families", uniqueFamilies);
        uniqueSubFamilies = findUniqueValues("SUBFAMILY");
        uniqueSupertribes = findUniqueValues("SUPERTRIBE");
        uniqueTribes = findUniqueValues("TRIBE");
        uniqueGenus = findUniqueValues("GENUS");
        uniqueSpecies = findUniqueValues("SPECIES");
        uniqueBinaryCombination = findUniqueValues("BINARY_COMBINATION");

        // filter();
      } else {
        console.error("Failed to fetch the data");
      }
    } catch (error) {
      console.error("Error fetching JSON data:", error);
    }
  };

  onMount(async () => {
    fetchJSONData();

    const unsubscribe = selectedFamiliesStore.subscribe((value) => {
      console.log("Updated selectedFamiliesStore:", value);
      // You can perform further actions whenever selectedFamiliesStore changes
      // For instance, update other components or trigger other functions here
    });

    return () => {
      unsubscribe(); // Unsubscribe when the component is destroyed
    };
  });

  const findUniqueValues = (property) => {
    const values = metaData.map((sample) => sample[property]);
    return [...new Set(values)];
  };

  // const filter = () => {
  //   const genusFilter = metaData.filter((sample) => sample.GENUS === "Arabis");
  //   const growthFilterh = metaData.filter(
  //     (sample) => sample.GROWTH_FORM === "H"
  //   );
  //   const growthFilterw = metaData.filter(
  //     (sample) => sample.GROWTH_FORM === "W"
  //   );
  //   console.log(genusFilter);
  //   console.log(growthFilterh);
  //   console.log(growthFilterw);
  // };

  let selectedFamilies = {};

  const handleItemSelection = (event, family) => {
    const isChecked = event.target.checked;

    selectedFamilies = {
      ...selectedFamilies,
      [family]: isChecked,
    };

    // Get an array of keys where the value is true (i.e., selected families)
    const selectedKeys = Object.keys(selectedFamilies).filter(
      (key) => selectedFamilies[key]
    );

    // Update the selectedFamiliesStore with the updated value
    updateSelectedFamilies(selectedKeys);
  };

  // Function to filter the treemap based on selected families
  const filterTreemap = (tree) => {
    if (!tree || typeof tree !== "object") {
      return null;
    }

    // Filter out keys that are not selected in selectedFamilies
    for (const key in tree) {
      if (tree.hasOwnProperty(key)) {
        if (!selectedFamilies[key]) {
          delete tree[key];
        } else {
          tree[key] = filterTreemap(tree[key]);
        }
      }
    }

    return tree;
  };
</script>

<section id="filters">
  <!-- Dropdown to choose taxonomy -->
  <label for="taxonomy-select">Taxonomy</label>

  <select name="taxonomy" id="taxonomy-select">
    <option value="all">All</option>
    <option value="subfamily">Sub-Family</option>
    <option value="supertribe">Supertribe</option>
    <option value="tribe">Tribe</option>
    <option value="genus">Genus</option>
    <option value="species">Species</option>
    <option value="speciesfull">Binary combination</option>
  </select>

  <h3>Family</h3>
  <div class="filtercontainer">
    {#each uniqueFamilies as family}
      <label>
        <input
          type="checkbox"
          bind:checked={selectedFamilies[family]}
          on:change={(event) => handleItemSelection(event, family)}
        />
        {family}
      </label>
    {/each}
  </div>
</section>

<style>
  #filters {
    border: solid 2px black;
    border-radius: 5px;
  }
  .filtercontainer {
    width: calc(100vw / 5);
    height: 200px;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
  }
</style>
