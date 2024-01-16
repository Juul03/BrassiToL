import { writable } from 'svelte/store';

// Initialize the store with an empty array
export const selectedTaxonomyStore = writable([]);

// Function to update the store
export const updateSelectedTaxonomy = (taxonomyArray, taxonomyType) => {
  selectedTaxonomyStore.update((selectedTaxonomy) => {
    return {
      ...selectedTaxonomy,
      [taxonomyType]: taxonomyArray,
    };
  });
};
