<script>
    let isZooming = false;
  
    let toggleZoom = () => {
      isZooming = !isZooming;
      updateCursor();
    };
  
    let updateCursor = () => {
      const body = document.body;
      body.style.cursor = isZooming ? 'zoom-in' : 'auto';
    };

    $: {
      // Use Svelte's reactive statement to add/remove the 'zooming' class
      if (isZooming) {
        document.body.classList.add('zooming');
      } else {
        document.body.classList.remove('zooming');
      }
    }
  </script>
  
  <button on:click={toggleZoom}>Toggle Zoom</button>
  
  <!-- Container of tree -->
  <div id="phyloTree"></div>
  
  <style>
    /* Add your existing styles here */
  
    /* Style the button */
    button {
      position: absolute;
      left: 20px;
      top: 60px; /* Adjust the top position as needed */
      padding: 10px;
      cursor: pointer;
    }
  
    /* Add a class to body when zooming */
    .zooming {
      cursor: zoom-in !important;
    }
  </style>
  