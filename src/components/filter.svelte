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
</script>
