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
      <ol>
        <li>Brassicaceae</li>
        <li>Brassicoideae</li>
        <li>Camelinodae (I)</li>
        <li>Boechereae</li>
        <li>Sandbergia</li>
        <li>whitedii</li>
      </ol>
      <div class="img-container">
        <img src="images/whitedii.jpg" alt="Whitedii" />
      </div>
      <div class="img-container">
        <img src="images/wereldkaart.jpg" alt="Wereldkaart" />
      </div>

      <ul>
        <li>Societal: N/A</li>
        <li>Geographic Area: S. British Columbia to N. Washington</li>
        <li>Dataset: Boechereae/Nik Hay</li>
      </ul>

    </div>
  </section>
{/if}

<style>
  /* Styles for the overlay and pop-up content (unchanged) */
  .popup {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 50%;
    height: 50%;
    transform: translateX(-50%) translateY(-50%);
    /* background-color: rgba(0, 0, 0, 0.5); */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .popup-content {
    padding: 1rem;
    width: 100%;
    max-width: 600px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    text-align: center;

    display: flex;
    flex-wrap: wrap;
    /* justify-content: center; */
    /* align-items: center; */
    position: relative;
  }

  .popup-content h2 {
    font-style: italic;
  }

  .popup-content h2 span {
    font-style: normal;
  }

  section {
    font-family: "Poppins";
  }

  button {
    font-family: "Poppins";
  }

  ol {
    display: flex;
    list-style-type: none;
    font-size: 13px;
  }

  ol li {
    padding: 0.2rem;
  }

  ol li:not(:last-child)::after {
    content: "<";
    /* position: absolute; */
    right: 0;
  }

  .close {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 20px;
    cursor: pointer;
    margin-top: 1rem;
  }

  /* Additional styles for the custom pop-up content (unchanged) */
  h2 {
    color: #3498db;
    font-size: 30px;
    text-align: center;
  }

  p {
    color: #333;
  }

  ul {
    list-style-type: none;
    text-align: left;
    padding: 0;
    margin-top: 1rem;
    font-size: 13px;
    display: flex;
    flex-direction: column;
  }

  ul li {
    padding: 0.2rem;
  }

  button {
    padding: 10px 20px;
    background-color: #3498db;
    color: #fff;
    border: none;
    border-radius: 3px;
    cursor: pointer;
  }

  .img-container:nth-of-type(1) {
    width: 40%;
    height: 15rem;
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    aspect-ratio: 1/1;
  }

  .img-container:nth-of-type(2) {
    width: 50%;
    height: 15rem;
    margin-top: 1rem;
    display: flex;
    justify-content: center;
  }

  .img-container img {
    max-width: 100%; /* Ensure images don't exceed the width of the container */
    max-height: 100%; /* Ensure images don't exceed the height of the container */
    object-fit: cover; /* Maintain the aspect ratio of the images */
  }

  /* img:nth-of-type(2) {
    max-width:50%;
    object-fit:contain;
  } */
</style>
