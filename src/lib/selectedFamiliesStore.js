import { writable } from 'svelte/store';

// Initialize the writable store with an empty object
export const selectedFamiliesStore = writable({});

// Update the value of the store whenever the selection changes
export function updateSelectedFamilies(families) {
  selectedFamiliesStore.set(families);
}
