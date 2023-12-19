<script>
    import { redirect } from "@sveltejs/kit";
    import { onMount } from "svelte";

    let metaData = [];

    const fetchJSONData = async () => {
        try {
            const response = await fetch("/data/metadataBrassiToL.json");
            if (response.ok) {
                const data = await response.json();
                metaData = data;
                filter();
                console.log(metaData);
            } else {
                console.error("Failed to fetch the data");
            }
        } catch (error) {
            console.error("Error fetching JSON data:", error);
        }
    }

    onMount(async () => {
        fetchJSONData();
    });

    const filter = () => {
        const genusFilter = metaData.filter((sample) => sample.GENUS === "Arabis");
        const growthFilterh = metaData.filter((sample) => sample.GROWTH_FORM === "H");
        const growthFilterw = metaData.filter((sample) => sample.GROWTH_FORM === "W");
        console.log(genusFilter);
        console.log(growthFilterh);
        console.log(growthFilterw);
    };

    
</script>
