import { writable } from 'svelte/store';

// Initialize the writable store with an empty object
export const selectedTaxonomyStore = writable({});

// Update the value of the store whenever the selection changes
export function updateSelectedTaxonomy(taxonomy) {
  selectedTaxonomyStore.set(taxonomy);
}
