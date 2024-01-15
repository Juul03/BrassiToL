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

  let selectedTaxonomyLevel = "all";

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

        uniqueBinaryCombination = findUniqueValues("SPECIES_NAME_PRINT");
        uniqueBinaryCombination.sort();

        // filter();
      } else {
        console.error("Failed to fetch the data");
      }
    } catch (error) {
      console.error("Error fetching JSON data:", error);
    }
  };

  let getSelectedTaxonomyLevel = (dropdownElement) => {
    selectedTaxonomyLevel = dropdownElement.value;
  };

  onMount(async () => {
    fetchJSONData();

    const dropdownTaxonomyElement = document.getElementById("taxonomy-select");
    dropdownTaxonomyElement.addEventListener("change", () =>
      getSelectedTaxonomyLevel(dropdownTaxonomyElement)
    );

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

  const removeSelectedItem = (taxonomy, item) => {
    selectedItems[taxonomy] = {
      ...selectedItems[taxonomy],
      [item]: false,
    };

    // Get an array of keys where the value is true (i.e., selected items for the specific taxonomy)
    const selectedKeys = Object.keys(selectedItems[taxonomy]).filter(
      (key) => selectedItems[taxonomy][key]
    );

    // Update the selectedTaxonomyStore with the updated value for the specific taxonomy
    updateSelectedTaxonomy(selectedKeys, taxonomy);
  };
</script>

<section id="filters">
  <!-- Dropdown to choose taxonomy level -->
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

  <div class="filtercontainer">
    <div class="searchbarcontainer">
      <label for="site-search" aria-label="search all taxonomy levels"></label>
      <input type="search" id="site-search" name="q" />

      <button>
        <!-- TODO: include searchicon -->
        O
      </button>
    </div>

    {#if selectedTaxonomyLevel === "all"}
      <p>Start by selecting in the dropdown above</p>
    {/if}

    {#if selectedTaxonomyLevel === "subfamily"}
      <!-- Render the corresponding options based on the selected taxonomy level -->
      <div class="filtercontainer">
        {#each uniqueSubFamilies as subfamily}
          <label>
            <input
              type="checkbox"
              bind:checked={selectedItems.subfamilies[subfamily]}
              on:change={(event) =>
                handleItemSelection(event, "subfamilies", subfamily)}
            />
            {subfamily}
          </label>
        {/each}
      </div>
    {/if}

    {#if selectedTaxonomyLevel === "supertribe"}
      <!-- Render the corresponding options based on the selected taxonomy level -->
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
    {/if}

    {#if selectedTaxonomyLevel === "tribe"}
      <!-- Render the corresponding options based on the selected taxonomy level -->
      <div class="filtercontainer">
        {#each uniqueTribes as tribe}
          <label>
            <input
              type="checkbox"
              bind:checked={selectedItems.tribes[tribe]}
              on:change={(event) => handleItemSelection(event, "tribes", tribe)}
            />
            {tribe}
          </label>
        {/each}
      </div>
    {/if}

    {#if selectedTaxonomyLevel === "genus"}
      <!-- Render the corresponding options based on the selected taxonomy level -->
      <div class="filtercontainer">
        {#each uniqueGenus as genus}
          <label>
            <input
              type="checkbox"
              bind:checked={selectedItems.genus[genus]}
              on:change={(event) => handleItemSelection(event, "genus", genus)}
            />
            {genus}
          </label>
        {/each}
      </div>
    {/if}

    {#if selectedTaxonomyLevel === "species"}
      <!-- Render the corresponding options based on the selected taxonomy level -->
      <div class="filtercontainer">
        {#each uniqueSpecies as specie}
          <label>
            <input
              type="checkbox"
              bind:checked={selectedItems.species[specie]}
              on:change={(event) =>
                handleItemSelection(event, "species", specie)}
            />
            {specie}
          </label>
        {/each}
      </div>
    {/if}

    {#if selectedTaxonomyLevel === "speciesfull"}
      <!-- Render the corresponding options based on the selected taxonomy level -->
      <div class="filtercontainer">
        {#each uniqueBinaryCombination as binaryComb}
          <label>
            <input
              type="checkbox"
              bind:checked={selectedItems.binaryCombination[binaryComb]}
              on:change={(event) =>
                handleItemSelection(event, "binaryCombination", binaryComb)}
            />
            {binaryComb}
          </label>
        {/each}
      </div>
    {/if}
  </div>

  <div id="selectioncontainer">
    <h3>Selected</h3>
    <ul>
      {#each Object.keys(selectedItems.subfamilies).filter((key) => selectedItems.subfamilies[key]) as selected}
        <li on:click={() => removeSelectedItem("subfamilies", selected)}>{selected}</li>
      {/each}
      {#each Object.keys(selectedItems.supertribes).filter((key) => selectedItems.supertribes[key]) as selected}
        <li on:click={() => removeSelectedItem("supertribes", selected)}>{selected}</li>
      {/each}
      {#each Object.keys(selectedItems.tribes).filter((key) => selectedItems.tribes[key]) as selected}
        <li on:click={() => removeSelectedItem("tribes", selected)}>{selected}</li>
      {/each}
      {#each Object.keys(selectedItems.genus).filter((key) => selectedItems.genus[key]) as selected}
        <li on:click={() => removeSelectedItem("genus", selected)}>{selected}</li>
      {/each}
      {#each Object.keys(selectedItems.species).filter((key) => selectedItems.species[key]) as selected}
        <li on:click={() => removeSelectedItem("species", selected)}>{selected}</li>
      {/each}
      {#each Object.keys(selectedItems.binaryCombination).filter((key) => selectedItems.binaryCombination[key]) as selected}
        <li on:click={() => removeSelectedItem("binaryCombination", selected)}>{selected}</li>
      {/each}
    </ul>
  </div>
</section>

<style>
  #filters {
    width: calc(100vw / 5);
    height: 80vh;
    padding: 1rem;
    border: solid 2px black;
    border-radius: 5px;
    display:flex;
    flex-direction:column;
    gap:1rem;
  }

  .filtercontainer, #selectioncontainer {
    width: calc(100vw / 6);
    height: 250px;
    /* overflow-y: scroll; */
    overflow-x: hidden;
    display: flex;
    flex-direction: column;

    padding: 0.5rem;
    background: rgb(233, 240, 243);
  }

  #selectioncontainer {
    height:150px;
    background:white;
  }

  #selectioncontainer h3 {
    margin:0;
  }

  #selectioncontainer ul {
    overflow-y: scroll;
    margin:0;
  }

  #filters > label {
    font-size: 1.5rem;
    font-weight: bold;
  }

  #filters > select,
  .searchbarcontainer > input {
    width: 80%;
    height: 2.1rem;
    font-size: 1.1rem;
  }

  select > option {
    font-size: 1.1rem;
  }

  .searchbarcontainer > button {
    width: 2.1rem;
    aspect-ratio: 1/1;
  }
</style>
