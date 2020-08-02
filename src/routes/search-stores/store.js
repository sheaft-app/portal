import { writable } from "svelte/store";

export const filters = writable({});
export const isLoading = writable(false);
export const isFetchingMore = writable(false);
export const items = writable([]);
