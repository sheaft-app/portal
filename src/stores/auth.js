import { writable } from "svelte/store";

export const authUserAccount = writable({ profile: { role: "ANONYMOUS", picture:"https://sheaftapp.blob.core.windows.net/pictures/users/profile.svg" } });
export const authInitialized = writable(false);
export const authRegistered = writable(false);
export const authAuthenticated = writable(false);
