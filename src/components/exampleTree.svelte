<script>
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
  