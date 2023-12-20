<script>
  import { redirect } from "@sveltejs/kit";
  import { onMount } from "svelte";

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
  let treemap = { Akaniaceae: 20, subtree: { Brassicaceae: 30, Limnanthaceae: 60 } };

const handleItemSelection = (event, family) => {
  selectedFamilies = {
    ...selectedFamilies,
    [family]: event.target.checked
  };
  console.log(selectedFamilies);
  console.log('treemap before', treemap);
  treemap = filterTreemap(treemap);
  console.log('treemap after', treemap);
};

// Function to filter the treemap based on selected families
function filterTreemap(tree) {
  if (!tree || typeof tree !== 'object') {
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