import { writable } from "svelte/store";

export const notifications = writable([]);
export const displayNotificationCenter = writable(false); 