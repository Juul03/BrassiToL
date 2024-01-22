<script>
  import { redirect } from "@sveltejs/kit";
  import { onMount } from "svelte";
  import {
    selectedTaxonomyStore,
    updateSelectedTaxonomy,
  } from "$lib/selectedTaxonomyStore";
  import { selectedExtraStore, updateSelectedExtra } from "$lib/selectedExtraStore";
  import nodeColorsStore from '$lib/nodeColorsStore';

  let metaData = [];

  // Stores the unique values in the metadata file (possible options to filter on)
  // Taxonomy unique values
  let uniqueFamilies = [];
  let uniqueSubFamilies = [];
  let uniqueSupertribes = [];
  let uniqueTribes = [];
  let uniqueGenus = [];
  let uniqueBinaryCombination = [];

  // Geography unique values
  let uniqueContinents = [];
  let uniqueGeographicalAreas = [];

  // Extra unique values
  let uniqueLifeforms = [];
  let uniqueClimates = [];
  let uniqueGrowthforms = [];
  let uniqueSocietalUses = [];
  let uniqueRedlistCategories = [];

  // Stores which filter is active, default taxonomy, other values are Geography or Extra
  let selectedFilterType = "Taxonomy"

  let selectedTaxonomyLevel = "all";
  let selectedGeographyLevel = "all";
  let selectedExtraLevel = "all";

  let nodeColors;

  const fetchJSONData = async () => {
    try {
      const response = await fetch("/data/metadataBrassiToL.json");
      if (response.ok) {
        const data = await response.json();
        metaData = data;

        findUniqueValuesTaxonomy();
        // findUniqueValuesGeography();
        findUniqueValuesExtra();
      } else {
        console.error("Failed to fetch the data");
      }
    } catch (error) {
      console.error("Error fetching JSON data:", error);
    }
  };

  let findUniqueValuesTaxonomy = () => {
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

    uniqueBinaryCombination = findUniqueValues("SPECIES_NAME_PRINT");
    uniqueBinaryCombination.sort();
  }

  let findUniqueValuesExtra = () => {
    // Find all unique extras and store them in the variables
    // UNIQUELIFEFORMS
    let uniqueLifeformsRaw = findUniqueValues("WCVP_lifeform_description");
    let uniqueLifeformsSet = new Set();

    // Remove the "," and "or" and place the values in an array seperately
    uniqueLifeformsRaw.forEach((value) => {
      const types = extractLifeforms(value);
      types.forEach((type) => uniqueLifeformsSet.add(type));
    });

    // Convert the Set back to an array
    uniqueLifeforms = [...uniqueLifeformsSet];

    // sort on alphabet
    // Sort alphabetically but keep "NA" at the end
    uniqueLifeforms = uniqueLifeforms.sort((a, b) => {
      if (a === "NA") {
        return 1; // "NA" should be at the end
      } else if (b === "NA") {
        return -1; // "NA" should be at the end
      } else {
        return a.localeCompare(b); // Sort alphabetically for other values
      }
    });


    uniqueClimates = findUniqueValues("WCVP_climate_description");
    // console.log("unique climates", uniqueClimates)
    uniqueGrowthforms = findUniqueValues("GROWTH_FORM");
    uniqueSocietalUses = findUniqueValues("SOCIETAL_USE");
    uniqueRedlistCategories = findUniqueValues("IUCN_redlistCategory");
  }

  // Function to extract individual lifeform types
  const extractLifeforms = (value) => {
  // Split the value by commas and "or"
  const types = value.split(/,| or /);

  // Remove leading and trailing spaces from each type
  const cleanedTypes = types.map((type) => type.trim());

  // Filter out empty strings and remove duplicate types
  const uniqueTypes = [...new Set(cleanedTypes.filter((type) => type !== ''))];

  return uniqueTypes;
};

  onMount(async () => {
    await fetchJSONData();
    setupEventListeners();
   
    const unsubscribe = selectedTaxonomyStore.subscribe((value) => {
      console.log("Updated selectedTaxonomyStore:", value);
      // You can perform further actions whenever selectedTaxonomyStore changes
      // For instance, update other components or trigger other functions here
    });

    // Subscribe to nodeColorsStore
      const unsubscribeColors = nodeColorsStore.subscribe(value => {
      nodeColors = value;
      console.log("COLORS", nodeColors)
    });

    $: console.log("Updated nodeColors:", nodeColors);

    return () => {
      unsubscribe(); // Unsubscribe when the component is destroyed
      unsubscribeColors();
    };
  });

   // Function to find the selected value in the dropdown menu
   let getSelectedLevel = (dropdownElement, storeVar) => {
    if(storeVar === selectedTaxonomyLevel) {
      selectedTaxonomyLevel = dropdownElement.value;
    }

    if(storeVar === selectedGeographyLevel) {
      selectedGeographyLevel = dropdownElement.value
    }

    if(storeVar === selectedExtraLevel) {
      selectedExtraLevel = dropdownElement.value
      console.log("selectedleve;", selectedExtraLevel)
    }
  };

  let setupEventListeners = () => {
    const dropdownTaxonomyElement = document.getElementById("taxonomy-select");
    if(dropdownTaxonomyElement !== null) {
      console.log("taxxx")
      dropdownTaxonomyElement.addEventListener("change", () =>
      getSelectedLevel(dropdownTaxonomyElement, selectedTaxonomyLevel)
    );
    }
    
    const dropdownGeographicalElement = document.getElementById("geography-select");
    if(dropdownGeographicalElement !== null) {
      console.log("geo")
      dropdownGeographicalElement.addEventListener("change", () => {
      getSelectedLevel(dropdownGeographicalElement, selectedGeographicalLevel);
    })
    }

    const dropdownExtraElement = document.getElementById("extra-select");
    if(dropdownExtraElement !== null) {
      console.log("extraaaaa")
      dropdownExtraElement.addEventListener("change", () => {
      getSelectedLevel(dropdownExtraElement, selectedExtraLevel);
    })
    }

    }

  const findUniqueValues = (property) => {
    const values = metaData.map((sample) => sample[property]);
    return [...new Set(values)];
  };

  let selectedItems = {
    families: {},
    subfamilies: {},
    supertribes: {},
    tribes: {},
    genus: {},
    binaryCombination: {},
  };

  let selectedItemsExtra = {
    lifeforms: {},
  }

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

  const handleItemSelectionExtra = (event, extra, item) => {
    const isChecked = event.target.checked;

    selectedItemsExtra[extra] = {
      ...selectedItemsExtra[extra],
      [item]: isChecked,
    };

    console.log("selected", selectedItemsExtra)

    // Get an array of keys where the value is true (i.e., selected items for the specific extra)
    const selectedKeys = Object.keys(selectedItemsExtra[extra]).filter(
      (key) => selectedItemsExtra[extra][key]
    );

    console.log("selectedleys", selectedKeys)

    // Update the selectedExtraStore with the updated value for the specific extra
    updateSelectedExtra(selectedKeys, extra);
  }

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

  const removeAllSelectedItems = () => {
    // Clear selected items for each taxonomy level
    clearSelectedItems("subfamilies");
    clearSelectedItems("supertribes");
    clearSelectedItems("tribes");
    clearSelectedItems("genus");
    clearSelectedItems("binaryCombination");
  };

  const clearSelectedItems = (taxonomyLevel) => {
    // Set the selectedItems for the specified taxonomy level to an empty object
    selectedItems[taxonomyLevel] = {};

    // Update selectedTaxonomyStore
    const selectedKeys = Object.keys(selectedItems[taxonomyLevel]).filter(
      (key) => selectedItems[taxonomyLevel][key]
    );
    updateSelectedTaxonomy(selectedKeys, taxonomyLevel);
  };

  const handleFilterTypeClick = (filterType) => {
    // Update selectedFilterType when a filter type is clicked
    selectedFilterType = filterType;

    // Set a variable to store the selected filter type class
    const selectedClass = "selected";

    // Remove the selected class from all li elements
    const navItems = document.querySelectorAll('nav ul li');
    navItems.forEach((item) => {
      item.classList.remove(selectedClass);
    });

    // Add the selected class to the clicked li element
    const selectedNavItem = document.querySelector(`nav ul li.${filterType.toLowerCase()}`);
    if (selectedNavItem) {
      selectedNavItem.classList.add(selectedClass);
    }
  };

  // Data manipulation function
  let matchSpecieWithSample = (name, data) => {
    const foundDataPoint = data.find(
      (datapoint) => datapoint.SPECIES_NAME_PRINT === name
    );
    if (foundDataPoint) {
      return foundDataPoint.SAMPLE;
    }
    return sample;
  };

/* Function to get node color based on the selected taxonomy */
let getNodeColor = (selected) => {
  let correspondingSample = matchSpecieWithSample(selected, metaData)
  let nodeColorsObject = nodeColors[correspondingSample];
  let colorSpecie = nodeColorsObject.color;
  return colorSpecie
};

let getNodeColorGenus = (selectedGenus) => {
  // Assuming there is a property in metaData that represents the genus
  const foundDataPoint = metaData.find(
    (datapoint) => datapoint.GENUS === selectedGenus
  );

  if (foundDataPoint) {
    // Assuming there is a property in metaData that represents the supertribe
    const supertribe = foundDataPoint.SUPERTRIBE;
    console.log("supertribe", supertribe)

    // Assuming nodeColors is an object with colors for each supertribe
    const nodeColorsObject = nodeColors[supertribe];

    if (nodeColorsObject) {
      return nodeColorsObject.color;
    }
  }

  // Return a default color if not found
  return "defaultColor";
};

$: liStyles = (selected) => {
  console.log("Updating liStyles for", selected);
  return {
    'background-color': getNodeColor(selected),
  };
};

$: liStylesGenus = (selectedGenus) => {
  console.log("Updating liStylesGenus for", selectedGenus);
  return {
    'background-color': getNodeColorGenus(selectedGenus),
  };
};
</script>

<section id="filters">
  <!-- Nav to choose which filter type is showing -->
  <nav>
    <ul>
      <li>
        <img src="/icons/arrowIcon.svg" alt="filters">
        <img src="/icons/filterIcon.svg" alt="filters"></li>
        <!-- TODO: Add and remove the class in js based on which item is clicked -->
      <li class="selected" on:click={() => handleFilterTypeClick("Taxonomy")} on:click={() => setupEventListeners()}>Taxonomy</li>
      <li on:click={() => handleFilterTypeClick("Geography")} on:click={() => setupEventListeners()}>Geographical</li>
      <li on:click={() => handleFilterTypeClick("Extra")} on:click={() => setupEventListeners()}>Miscellaneous</li>
    </ul>
  </nav>

  <div class="filtercategorycontainer">
    {#if selectedFilterType === "Taxonomy"}
      <!-- Dropdown to choose taxonomy level -->
      <label for="taxonomy-select">Taxonomy</label>

      <select name="taxonomy" id="taxonomy-select">
        <option value="all">All</option>
        <option value="subfamily">Sub-Family</option>
        <option value="supertribe">Supertribe</option>
        <option value="tribe">Tribe</option>
        <option value="genus">Genus</option>
        <option value="speciesfull">Species</option>
      </select>
    {/if}

    {#if selectedFilterType === "Geography"}
      <!-- Dropdown to choose taxonomy level -->
      <label for="geography-select">Geography</label>

      <select name="geography" id="geography-select">
        <option value="all">All</option>
        <option value="continent">Continent</option>
        <option value="geographicarea">Geographic Area</option>
      </select>
    {/if}

    {#if selectedFilterType === "Extra"}
      <!-- Dropdown to choose taxonomy level -->
      <label for="extra-select">Extra</label>

      <select name="extra" id="extra-select">
        <option value="all">All</option>
        <option value="lifeform">Lifeform</option>
        <option value="climate">Climate</option>
        <option value="growthform">Growthform</option>
        <option value="societal">Societal</option>
        <option value="genustype">Genustype</option>
      </select>
    {/if}

  
    <div class="filtercontainer">
      <div class="searchbarcontainer">
        <label for="site-search" aria-label="search all taxonomy levels"></label>
        <input type="search" id="site-search" placeholder="Search..." name="q" />
  
        <button>
          <img src="/icons/searchIcon.svg" alt="search"/>
        </button>
      </div>
  
      {#if selectedFilterType === 'Taxonomy'}
        {#if selectedTaxonomyLevel === "all"}
          <p>Search a specific species or start by selecting in the dropdown above</p>
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

        {#if selectedTaxonomyLevel === "speciesfull"}
          <!-- Render the corresponding options based on the selected taxonomy level -->
          <div class="filtercontainer">
            {#each uniqueBinaryCombination as binaryComb}
              <label class="species">
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
      {/if}


      {#if selectedFilterType === "Extra"}
        {#if selectedExtraLevel === "all"}
          <p>Search a specific item or start by selecting in the dropdown above</p>
        {/if}

        {#if selectedExtraLevel === "lifeform"}
          {#each uniqueLifeforms as lifeform}
            <label>
              <input
                type="checkbox"
                bind:checked={selectedItemsExtra.lifeforms[lifeform]}
                on:change={(event) =>
                  handleItemSelectionExtra(event, "lifeforms", lifeform)}
              />
              {lifeform}
            </label>
          {/each}
        {/if}
      {/if}
    </div>
  </div>

  <div id="selectioncontainer">
    <header>
      <h3>Selected</h3>
      <button on:click={() => removeAllSelectedItems()} class="clearAllButton">
        Clear all
        <img src="icons/removeIconDark.svg" alt="remove" />
      </button>
    </header>

    <ul>
      {#each Object.keys(selectedItems.subfamilies).filter((key) => selectedItems.subfamilies[key]) as selected}
        <li on:click={() => removeSelectedItem("subfamilies", selected)}>
          Subfamily: {selected} <img src="icons/removeIcon.svg" alt="remove" />
        </li>
      {/each}
      {#each Object.keys(selectedItems.supertribes).filter((key) => selectedItems.supertribes[key]) as selected}
        <li on:click={() => removeSelectedItem("supertribes", selected)}>
          Supertribe: {selected} <img src="icons/removeIcon.svg" alt="remove" />
        </li>
      {/each}
      {#each Object.keys(selectedItems.tribes).filter((key) => selectedItems.tribes[key]) as selected}
        <li on:click={() => removeSelectedItem("tribes", selected)}>
          Tribe: {selected} <img src="icons/removeIcon.svg" alt="remove" />
        </li>
      {/each}
      {#each Object.keys(selectedItems.genus).filter((key) => selectedItems.genus[key]) as selected}
        <li style="background-color: {getNodeColorGenus(selected)}" on:click={() => removeSelectedItem("genus", selected)}>
          Genus: {selected} <img src="icons/removeIcon.svg" alt="remove" />
        </li>
      {/each}
      {#each Object.keys(selectedItems.binaryCombination).filter((key) => selectedItems.binaryCombination[key]) as selected}
        <li style="background-color: {getNodeColor(selected)}" on:click={() => removeSelectedItem("binaryCombination", selected)} >
          <span>Species: <span class="species">{selected}</span></span> <img src="icons/removeIcon.svg" alt="remove" />
        </li>
      {/each}
    </ul>
  </div>
</section>

<style>
  #filters {
    width: calc(100vw / 4);
    height: 85vh;
    padding: 1rem;
    background: var(--primary-color-dark-2);
    position: relative;
  }

  .filtercategorycontainer {
    padding: 0.5rem;
    height: 50%;
    background:var(--primary-color-light-2);
    border-radius:var(--standard-border-radius) var(--standard-border-radius) 0 0;
  }

  .filtercontainer {
    flex-grow: 1;
    min-width: 0; /* Allow flex items to shrink */
    height: 70%;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 0.5rem; 
    padding: 0.5rem;
    /* background: var(--primary-color-light-2); */
  }

  .filtercontainer .filtercontainer {
    box-shadow: inset 0px -8px 8px -8px rgba(0, 0, 0, 0.25);
  }

  .species {
    font-style:italic;
  }

  nav {
    transform: rotate(90deg) translate(45.35%, calc(-588%));
    position: absolute;
    top: 0;
    right: 0;
  }

  nav ul {
    display: flex;
    gap: 0.25rem;
    list-style: none;
  }

  nav ul li {
    padding: 0.5rem;
    border-radius: var(--standard-border-radius) var(--standard-border-radius) 0 0;
    background: var(--primary-color-light-1);
    transition:var(--standard-transition-time);
  }

  nav ul li:hover {
    background:var(--primary-color-dark-2);
  }

  nav ul li:first-child {
    background:var(--primary-color-dark-2);
  }

  nav ul li:first-child:hover {
    background:var(--primary-color-dark-1);
  }

  nav ul li.selected {
    background: var(--primary-color-dark-2);
  }

  nav ul li:first-child {
    width:3rem;
  }

   img:first-child {
    transform:rotate(-90deg);
    transition:var(--standard-transition-time);
  }

  nav ul li:first-child:hover img:first-child {
    transform:rotate(90deg);
  }

  #selectioncontainer {
    flex-basis: 100%; /* Make it take up full width */
    height: 30%;
    background: white;
    border-top: solid 2px var(--primary-color-light-1);
    padding: 0.5rem;
    background: rgb(233, 240, 243);
  }

  #selectioncontainer > header {
    display: flex;
    justify-content: space-between;
  }

  #selectioncontainer ul {
    height: 100px;
    overflow-y: scroll;
    box-shadow: inset 0px -8px 8px -8px rgba(0, 0, 0, 0.25);
  }

  .clearAllButton {
    background: var(--primary-color-light-2);
    border: none;
    width: fit-content;
    padding: 0.25rem;
    text-decoration: underline;
    text-underline-offset: 1px;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    border-radius: var(--standard-border-radius);
    transition: var(--standard-transition-time);
  }

  .clearAllButton img {
    margin-left: 0.5rem;
  }

  .clearAllButton:hover {
    background: var(--primary-color-light-1);
    border: none;
    text-decoration: underline;
    transform:scale(1.1);
    text-underline-offset: 3px;
  }

  #selectioncontainer{
    background:var(--primary-color-light-2);
    border-radius:0 0 var(--standard-border-radius) var(--standard-border-radius);
  }

  #selectioncontainer ul {
    height:80%;
    overflow-y: scroll;
    list-style: none;
    display: flex;
    flex-direction: column;
  }

  #selectioncontainer ul li {
    font-size: var(--standard-font-size-body);
    color:white;
    width:85%;
    padding: 0.25rem;
    margin: 0.25rem;
    text-align: left;
    
    border-radius: var(--standard-border-radius);
    display: flex;
    justify-content: space-between;

    transition: var(--basic-transition-time);
  }

  #selectioncontainer ul li:hover {
    background: lightblue;
  }

  ul li img {
    margin-left: 0.5rem;
  }

  .filtercategorycontainer > label {
    font-size:var(--standard-font-size-header);
    font-style:var(--standard-font-style-header);
    font-weight:var(--standard-font-weight-header);
  }

  .filtercategorycontainer > select,
  .searchbarcontainer > input {
    width: 85%;
    height: 2.1rem;
    padding-left:.5rem;
    font-size: var(--standard-font-size-body);
    font-style: var(--standard-font-style-body);
    font-weight: var(--standard-font-weight-body);
    border-radius:var(--standard-border-radius);

    transition:var(--standard-transition-time);
  }

  .filtercategorycontainer > select:hover {
    background:var(--primary-color-light-2);
  }

  .filtercategorycontainer > select:focus {
    border-radius: var(--standard-border-radius) var(--standard-border-radius) 0 0;
  }

  select > option {
    font-size: var(--standard-font-size-body);
    font-style: var(--standard-font-style-body);
    font-weight: var(--standard-font-weight-body);

    background:var(--primary-color-light-1);
  }

  select > option:first-child {
    border-radius:0;
  }

  select > option:last-child {
    border-radius: 0 0 var(--standard-border-radius) var(--standard-border-radius);
  }

  .searchbarcontainer > button {
    transform:translateX(-150%) rotate(180deg);
    background:transparent;
    border:none;
    width: 1.5rem;
    aspect-ratio: 1/1;

    transition:var(--standard-transition-time);
  }

  .searchbarcontainer:hover > button {
    transform:translateX(-150%) rotate(180deg) translateY(10%);
  }

  .searchbarcontainer > button > img {
    width:80%;
    height:80%;
  }
</style>
