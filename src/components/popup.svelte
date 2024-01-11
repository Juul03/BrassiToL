<!-- Popup.svelte -->

<script>
  let isOpen = false;

  function openPopup() {
    isOpen = true;
  }

  function closePopup() {
    isOpen = false;
  }
</script>

<button on:click={openPopup}>Open Pop-up</button>

{#if isOpen}
  <section class="popup">
    <div class="popup-content">
      <span class="close" on:click={closePopup}>&times;</span>
      <h2>Plant name <span>(R.Name)</span></h2>
      <p>This is a custom pop-up content.</p>
      <img src="images/whitedii.jpg" alt="Whitedii" />
      <img src="images/wereldkaart.jpg" alt="Wereldkaart" />
      <button on:click={closePopup}>Close Pop-up</button>
    </div>
  </section>
{/if}

<style>
  /* Styles for the overlay and pop-up content (unchanged) */
  .popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 50%;
    height: 50%;
    /* background-color: rgba(0, 0, 0, 0.5); */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .popup-content {
    padding: 40px;
    width: 60%;
    max-width: 600px;
    height: auto;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    text-align: center;
  }

  .popup-content h2 {
    font-style:italic;
  }

  .popup-content h2 span {
    font-style:normal;
  }

  .close {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 20px;
    cursor: pointer;
  }

  /* Additional styles for the custom pop-up content (unchanged) */
  h2 {
    color: #3498db;
  }

  p {
    color: #333;
  }

  button {
    padding: 10px 20px;
    background-color: #3498db;
    color: #fff;
    border: none;
    border-radius: 3px;
    cursor: pointer;
  }

  img {
    max-width: 40%; /* Ensure images don't exceed the width of the popup */
    margin-top: 15px; /* Add spacing between images and other elements */
  }
</style>
