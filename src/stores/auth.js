import { writable } from "svelte/store";

export const authUserAccount = writable({ profile: { role: "ANONYMOUS", picture:"https://content.sheaft.com/pictures/users/profile.svg" } });
export const authInitialized = writable(false);
export const authRegistered = writable(false);
export const authAuthenticated = writable(false);
export const authAuthorized = writable(false);
