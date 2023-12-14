<script>
    import { onMount, afterUpdate, onDestroy } from 'svelte';
    // Import Phylocanvas library
    import Phylocanvas from 'phylocanvas';
  
    let treeData = '(((A:0.1,B:0.2):0.3,C:0.4):0.5,D:0.6)';
    let treeInitialized = false;
  
    onMount(() => {
      // No need to check window object when using SvelteKit
      const container = document.getElementById('phylocanvas-container');
  
      if (container) {
        const tree = Phylocanvas.createTree(container, {
          newick: treeData,
          type: 'circular'
          // You can add more configurations or styles here as needed
        });
  
        tree.load();
        treeInitialized = true;
      }
    });
  
    afterUpdate(() => {
      if (treeInitialized) {
        onDestroy(() => {
          // Destroy the tree on component unmount
          // to avoid memory leaks
          tree.destroy();
        });
      }
    });
  </script>
  
  {#if treeInitialized}
    <div id="phylocanvas-container" style="width: 800px; height: 800px;"></div>
  {:else}
    <p>Loading...</p>
  {/if}
  