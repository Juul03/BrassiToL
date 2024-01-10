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
    <div class="popup">
      <div class="popup-content">
        <span class="close" on:click={closePopup}>&times;</span>
        <p>This is a Svelte pop-up content.</p>
      </div>
    </div>
  {/if}
  
  <style>
    /* Styles for the overlay */
    .popup {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
    }
  
    /* Styles for the pop-up content */
    .popup-content {
      padding: 20px;
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 5px;
      text-align: center;
    }
  
    /* Style for the close button */
    .close {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 20px;
      cursor: pointer;
    }
  </style>
  