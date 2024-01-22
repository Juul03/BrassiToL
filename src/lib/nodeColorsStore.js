import { writable } from 'svelte/store';

// Initial value of nodeColors
const initialNodeColors = {};

// Create a writable store
const nodeColorsStore = writable(initialNodeColors);

export default nodeColorsStore;
