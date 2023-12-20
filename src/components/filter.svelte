<script>
  import { redirect } from "@sveltejs/kit";
  import { onMount } from "svelte";
  import {
    selectedFamiliesStore,
    updateSelectedFamilies,
  } from "$lib/selectedFamiliesStore";

  let metaData = [];
  let uniqueFamilies = [];

  const fetchJSONData = async () => {
    try {
      const response = await fetch("/data/metadataBrassiToL.json");
      if (response.ok) {
        const data = await response.json();
        metaData = data;
        findUniqueFamilies();
        console.log("unique", uniqueFamilies);
        filter();
        console.log(metaData);
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

  const findUniqueFamilies = () => {
    const families = metaData.map((sample) => sample.FAMILY);
    uniqueFamilies = [...new Set(families)];
  };

  const filter = () => {
    const genusFilter = metaData.filter((sample) => sample.GENUS === "Arabis");
    const growthFilterh = metaData.filter(
      (sample) => sample.GROWTH_FORM === "H"
    );
    const growthFilterw = metaData.filter(
      (sample) => sample.GROWTH_FORM === "W"
    );
    console.log(genusFilter);
    console.log(growthFilterh);
    console.log(growthFilterw);
  };

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
  function filterTreemap(tree) {
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
  }
</script>

<h3>Select Items:</h3>
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
