<script>
  import { onMount } from "svelte";
  import { parse } from "phylotree";

  let treeData = null; // Variable to store parsed tree data

  onMount(async () => {
    try {
      // Read your Nexus file (assuming it's in a file named 'tree.nex')
      const response = await fetch("data/BrassiToL_easy.tree");
      const nexusContent = await response.text();

      // Parse the Nexus content
      const tree = parse(nexusContent);

      // Get the tree data
      treeData = tree.toJSON();
    } catch (error) {
      console.error("Error loading Nexus file:", error);
    }
  });
</script>

<h2>Phylogenetic Tree</h2>

{#if treeData}
  <!-- Display the parsed tree data -->
  <pre>{JSON.stringify(treeData, null, 2)}</pre>
{:else}
  <p>Loading tree data...</p>
{/if}

<!-- <script>
    import { onMount } from "svelte";
    import Treelib from "treelib";
  
    let treeData = {};
  
    onMount(() => {
      const tree = new Treelib();
      tree.path("a/b/c").setValue("foobar");
      treeData = tree.get();
    });
  </script>
  
  <div id="treemap-container">
    <pre>
      {JSON.stringify(treeData, null, 2)}
    </pre>
  </div>
  
  <style>
    #treemap-container {
      width: 400px;
      height: 300px;
      border: 1px solid #ccc;
    }
  </style>
   -->
