import { writable } from "svelte/store";
import { config } from "./../configs/config";

export const authUserAccount = writable({ profile: { id: null, role: "ANONYMOUS", picture: config.content + '/pictures/users/profile.svg' } });
export const authInitialized = writable(false);
export const authRegistered = writable(false);
export const authAuthenticated = writable(false);
export const authAuthorized = writable(false);
