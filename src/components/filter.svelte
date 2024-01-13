<script>
  import { redirect } from "@sveltejs/kit";
  import { onMount } from "svelte";
  import {
    selectedTaxonomyStore,
    updateSelectedTaxonomy,
  } from "$lib/selectedTaxonomyStore";

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
        uniqueFamilies.sort();

        uniqueSubFamilies = findUniqueValues("SUBFAMILY");
        uniqueSubFamilies.sort();

        uniqueSupertribes = findUniqueValues("SUPERTRIBE");
        uniqueSupertribes.sort();

        uniqueTribes = findUniqueValues("TRIBE");
        uniqueTribes.sort();

        uniqueGenus = findUniqueValues("GENUS");
        uniqueGenus.sort();

        uniqueSpecies = findUniqueValues("SPECIES");
        uniqueSpecies.sort();

        uniqueBinaryCombination = findUniqueValues("BINARY_COMBINATION");
        uniqueBinaryCombination.sort();

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

    const unsubscribe = selectedTaxonomyStore.subscribe((value) => {
      console.log("Updated selectedTaxonomyStore:", value);
      // You can perform further actions whenever selectedTaxonomyStore changes
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

  let selectedItems = {
    families: {},
    subfamilies: {},
    supertribes: {},
    tribes: {},
    genus: {},
    species: {},
    binaryCombination: {},
  };

  const handleItemSelection = (event, taxonomy, item) => {
    const isChecked = event.target.checked;

    selectedItems[taxonomy] = {
      ...selectedItems[taxonomy],
      [item]: isChecked,
    };

    // Get an array of keys where the value is true (i.e., selected items for the specific taxonomy)
    const selectedKeys = Object.keys(selectedItems[taxonomy]).filter(
      (key) => selectedItems[taxonomy][key]
    );

    // Update the selectedTaxonomyStore with the updated value for the specific taxonomy
    updateSelectedTaxonomy(selectedKeys, taxonomy);
  };

  // Function to filter the treemap based on selected items for the specific taxonomy
  const filterTreemap = (tree, taxonomy) => {
    if (!tree || typeof tree !== "object") {
      return null;
    }

    // Filter out keys that are not selected in selectedItems for the specific taxonomy
    for (const key in tree) {
      if (tree.hasOwnProperty(key)) {
        if (!selectedItems[taxonomy][key]) {
          delete tree[key];
        } else {
          tree[key] = filterTreemap(tree[key], taxonomy);
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
          bind:checked={selectedItems.families[family]}
          on:change={(event) => handleItemSelection(event, "families", family)}
        />
        {family}
      </label>
    {/each}
  </div>

  <h3>Supertribe</h3>
  <div class="filtercontainer">
    {#each uniqueSupertribes as supertribe}
      <label>
        <input
          type="checkbox"
          bind:checked={selectedItems.supertribes[supertribe]}
          on:change={(event) =>
            handleItemSelection(event, "supertribes", supertribe)}
        />
        {supertribe}
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
