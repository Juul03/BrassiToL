// src/selectedExtraStore.js
import { writable } from "svelte/store";

// Initial state
export const selectedExtraStore = writable({});

// Function to update selected extra items
export const updateSelectedExtra = (selectedItems, extra) => {
  selectedExtraStore.set({
    ...selectedExtraStore,
    [extra]: selectedItems,
  });
};
