import { writable } from "svelte/store";

export const cartItems = writable([]);
export const cartItemsOrderedByProducer = writable([]);
export const searchResults = writable([]);
export const cartExpanded = writable(false);
export const toggleMoreActions = writable(false);
export const selectedItem = writable(null);
export const regions = writable([]);
export const departments = writable([]);
export const allDepartmentsProgress = writable([]);
export const fullScreenMap = writable(false);