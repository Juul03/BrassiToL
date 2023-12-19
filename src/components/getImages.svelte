<script>
    import { onMount } from 'svelte';
    
    let images = [];
  
    onMount(async () => {
      try {
        // Fetch the HTML content of the page
        const response = await fetch('https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:278047-1/images');
        const html = await response.text();
  
        // Parse the HTML content to extract image URLs
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const imageElements = doc.querySelectorAll('img');
  
        // Extract image URLs and alt text and push them to the images array
        imageElements.forEach(img => {
          const imageUrl = img.getAttribute('src');
          const altText = img.getAttribute('alt') || 'Image';
          images.push({ src: imageUrl, alt: altText });
        });
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    });
  </script>
  
  <h1>Images</h1>
  
  {#if images.length > 0}
    {#each images as { src, alt }}
      <img src={src} alt={alt} />
    {/each}
  {:else}
    <p>No images found</p>
  {/if}
  