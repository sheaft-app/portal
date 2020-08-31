<script>
  import { InitAuth } from "./services/SheaftAuth.js";
  import { InitNotifications } from "./services/SheaftNotifications.js";
  import { InitSignalr } from "./services/SheaftSignalr.js";
  import { InitRouter } from "./services/SheaftRouter.js";
  import { InitAnalytics } from "./services/SheaftAnalytics.js";
  import { InitGuard } from "./services/SheaftGuard.js";
  import { InitGraphQL } from "./services/SheaftGraphQL.js";
  import SheaftErrors from "./services/SheaftErrors.js";
  import Loader from "./components/Loader.svelte";
  import AcceptCookiePlaceholder from "./components/modal/AcceptCookiePlaceholder.svelte";
  import { cartItems, allDepartmentsProgress } from "./stores/app.js";
  import { onMount, onDestroy } from "svelte";
  import "notyf/notyf.min.css";
  import Icon from "svelte-awesome";
  import Router from "svelte-spa-router";
  import Modal from "./components/modal/Modal.svelte";
  import Nav from "./components/nav/Nav.svelte";
  import { selectedItem } from "./stores/app.js";
  import { authInitialized, authAuthenticated } from "./stores/auth.js";
  import { navExpended } from "./components/nav/store.js";
  import { config } from "./configs/config.js";
  import Tailwindcss from "./components/Tailwind.svelte";
  import {
    loginFreshdesk,
    logoutFreshdesk
  } from "./services/SheaftFreshdesk.js";

  $: isLoading = true;

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js", { scope: "./" });
  }

  const analyticsInstance = InitAnalytics(config.analytics.settings);
  const authInstance = InitAuth(config.auth.settings);
  const routerInstance = InitRouter();
  const guardInstance = InitGuard(authInstance, routerInstance);

  const notificationsInstance = InitNotifications({
    duration: 6000,
    ripple: true,
    dismissible: true,
    position: { x: "right", y: "top" }
  });

  const errorsHandlers = new SheaftErrors(notificationsInstance);
  const apiInstance = InitGraphQL(authInstance, config.api, errorsHandlers);

  const signalrInstance = InitSignalr(
    config.signalr + "/hubs/sheaft",
    authInstance,
    notificationsInstance
  );

  const authSubscription = authAuthenticated.subscribe(async authenticated => {
    if (!authenticated) {
      await logoutFreshdesk();
      return;
    }

    if (authenticated && authInstance.initialized) {
      signalrInstance.start();
      await loginFreshdesk();
    }

    var user = authInstance.user;
    if (
      user.state &&
      user.state.redirectTo &&
      user.state.redirectTo.slice(1) != "/"
    ) {
      routerInstance.goTo(user.state.redirectTo.slice(1), null, true);
    }
    
    if (config.production) {
      analyticsInstance.insights.clearAuthenticatedUserContext();
      analyticsInstance.insights.setAuthenticatedUserContext(user.profile.sub);
    }
  });

  const localStorageCartItems = JSON.parse(localStorage.getItem("user_cart"));
  if (localStorageCartItems) {
    cartItems.set(localStorageCartItems);
  }

  window.addEventListener("beforeinstallprompt", e => {});

  window.addEventListener("appinstalled", evt => {
    analyticsInstance.insights.trackEvent({
      description: "",
      type: "AppInstalled"
    });
    notificationInstance.info(
      "Vous avez installé l'application avec succès, pour vous remercier, nous allons créditer quelques points sur votre compte."
    );
    //TODO: register user points
  });

  window.addEventListener("load", () => {
    if (navigator.standalone) {
      analyticsInstance.insights.trackEvent(
        { description: "", type: "AppLoaded" },
        ["app"]
      );
    } else {
      analyticsInstance.insights.trackEvent(
        { description: "", type: "AppLoaded" },
        ["browser"]
      );
    }
  });

  onMount(async () => {
    isLoading = true;

    var sponsoring = routerInstance.getQueryParam("sponsoring");
    if (sponsoring) {
      localStorage.setItem("sponsoring", JSON.stringify(sponsoring));
    } else {
      localStorage.removeItem("sponsoring");
    }

    var role = routerInstance.getQueryParam("role");
    if (role) {
      localStorage.setItem("user_choosen_role", JSON.stringify(role.toUpperCase()));
      await authInstance.login();
    }

    isLoading = false;

    const progress = await fetch('https://sheaftapp.blob.core.windows.net/progress/departments.json')
      .then(response => response.json())
      .then(data => data);
      
    allDepartmentsProgress.set(progress);
  });

  onDestroy(async () => {
    window.removeEventListener("beforeinstallprompt");
    window.removeEventListener("load");
    window.removeEventListener("appinstalled");
    authSubscription.unsubscribe();
    authInstance.unregister();
    routerInstance.unregister();
    guardInstance.unregister();
    notificationInstance.unregister();
    await signalrInstance.stop();
  });
</script>

{#if !$authInitialized || isLoading}
  <div class="h-full flex text-center items-center justify-center bg-primary">
    <div class="text-center">
      <svg
        id="FEUILLES_V3"
        data-name="FEUILLES V3"
        xmlns="http://www.w3.org/2000/svg"
        style="height:150px;width:auto;"
        viewBox="0 0 217.22 220.01">
        <defs>
          <style>
            .cls-1,
            .cls-4 {
              fill: none;
            }
            .cls-1,
            .cls-3,
            .cls-4 {
              stroke: #fff;
              stroke-linecap: round;
            }
            .cls-1 {
              stroke-miterlimit: 10;
              stroke-width: 12px;
            }
            .cls-2,
            .cls-3 {
              fill: #fff;
            }
            .cls-3,
            .cls-4 {
              stroke-linejoin: round;
              stroke-width: 3px;
            }
          </style>
        </defs>
        <title>FAVICON_SHEAFT_V1_white</title>
        <g id="FRAISE">
          <path
            class="cls-1"
            d="M132,162.12s52.52-.66,72.3-48.83c12.54-30.51,5.76-73.38-1.9-99.37" />
          <path
            class="cls-1"
            d="M201.32,11.68c-26.91-4.35-73.44-12-102.39,4.1C53.22,41.2,49.87,96,49.87,96" />
          <circle class="cls-2" cx="175.01" cy="33.92" r="7.15" />
          <circle class="cls-2" cx="132.75" cy="89.66" r="7.15" />
          <circle class="cls-2" cx="164.44" cy="113.51" r="7.15" />
          <circle class="cls-2" cx="87.87" cy="82.5" r="7.15" />
          <circle class="cls-2" cx="113.51" cy="41.08" r="7.15" />
          <circle class="cls-2" cx="182.16" cy="75.35" r="7.15" />
          <circle class="cls-2" cx="113.51" cy="133.66" r="7.15" />
        </g>
        <path
          class="cls-3"
          d="M20.69,218.51c-6-73.94,41.35-65.24,51.15-62.67,1.12.29-21.12,13-4.84,39C77.41,211.43,27.35,207.26,20.69,218.51Z" />
        <path
          class="cls-3"
          d="M7.2,97.41c-.91,43.29,34,25.45,34,25.45C24.48,120.72,13.46,104.07,7.2,97.41Z" />
        <path
          class="cls-2"
          d="M89.25,209.55c-40.95-31.1-10.85-52-10.85-52C109.46,173.75,85,198.13,89.25,209.55Z" />
        <path
          class="cls-4"
          d="M1.5,162.34c36.09-45.51,58.21-9.16,58.21-9.16C40.57,188.18,14.35,158.14,1.5,162.34Z" />
        <path
          class="cls-2"
          d="M122.67,207.88c-30.45-12-13.73-29.82-13.73-29.82C131.09,182.69,118.44,201.65,122.67,207.88Z" />
      </svg>
      <div class="text-white font-bold" style="font-size:3em">SHEAFT</div>
    </div>
  </div>
{:else}
  {#if $selectedItem}
    <div
      on:click={() => selectedItem.set(null)}
      class="cursor-pointer w-full h-full opacity-50 bg-black fixed hidden
      lg:block"
      style="z-index: 7;" />
  {/if}
  <Nav />
  <main class:relative={!$navExpended} class:fixed={$navExpended}>
    <Modal>
      <div class="p-4 md:p-6 lg:p-8 h-full" id="main-content">
        <Router routes={guardInstance.routes} />
      </div>
      <AcceptCookiePlaceholder />
    </Modal>
  </main>
{/if}

<Tailwindcss />

<style global lang="scss">
  svg {
    display: inline !important;
  }

  @media (max-width: 374px) {
    .distance-badge-content svg {
      display: none !important;
    }
  }

  input:required {
    box-shadow: none;
  }
  input:invalid {
    box-shadow: none;
  }

  .text-normal {
    color: #205164;
  }

  .text-primary {
    color: #009688;
  }

  .text-accent {
    color: #ff4081;
  }

  .bg-accent {
    background-color: #ff4081;
    color: #ffffff;

    &:hover,
    &:focus {
      background-color: #ff4081 !important;
      color: #ffffff !important;
    }
  }

  .border-normal {
    border-color: #205164;
  }

  .border-accent {
    border-color: #ff4081;
  }

  .progressbar {
    width: 100%;
    max-width: 130px;
  }

  body {
    margin: 0;
    font-family: Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #205164;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0 0 0.5em 0;
    font-weight: 400;
    line-height: 1.2;
    color: #205164;
  }

  h1 {
    font-size: 2em;
  }

  .back-bg-clr {
    background-color: #fbfbfb !important;
  }

  .bg-primary {
    background: #009688;
    color: #ffffff !important;
  }

  .bg-light-primary {
    background: #b2dfdb;
  }

  .input-bg-clr {
    background-color: #fbfbfb;
  }

  .input-bd-clr {
    border-color: #e2e2e2;
  }

  main a,
  main .btn-link {
    color: #ff4081;
  }

  code {
    font-family: menlo, inconsolata, monospace;
    font-size: calc(1em - 2px);
    color: #555;
    background-color: #f0f0f0;
    padding: 0.2em 0.4em;
    border-radius: 2px;
  }

  @media (min-width: 400px) {
    body {
      font-size: 16px;
    }
  }

  /* Override des styles de Notyf */

  .success-color {
    color: #45ad43 !important;
  }

  .error-color {
    color: #ff5656 !important;
  }

  .warning-color {
    color: #fa9d45 !important;
  }

  .info-color {
    color: #389fcf !important;
  }

  .hold-color {
    color: #eee236 !important;
  }

  .help-color {
    color: #7159db !important;
  }

  .progress-color {
    color: #3fb8bd !important;
  }

  .accent-color {
    color: #ff4081 !important;
  }

  .primary-color {
    color: #009688 !important;
  }

  .notyf__toast {
    max-width: 400px !important;
    background-color: #ffffff !important;
  }

  .notyf__wrapper {
    align-items: flex-start !important;
  }

  .notyf__icon {
    margin-right: 20px !important;
  }

  .notyf__dismiss-btn {
    background-color: #ffffff !important;

    &:before,
    &:after {
      background: #333333 !important;
    }
  }

  .notyf {
    padding-top: 85px;
  }

  .material-icons {
    margin-top: 0;
    padding-right: 10px;
  }

  textarea.disabled,
  input.disabled,
  div.disabled,
  button.disabled {
    background: #e8e8e8 !important;
    color: #7b7b7b !important;
    cursor: not-allowed !important;
    transition: none !important;
  }

  .leaflet-popup-content-wrapper {
    @apply rounded-sm;
  }

  .leaflet-popup {
    bottom: 0 !important;
  }

  .leaflet-popup-content-wrapper {
    background-color: #009688;
    color: #ffffff;
  }

  .leaflet-popup-close-button {
    color: #ffffff !important;
  }

  .leaflet-popup-tip {
    background-color: #009688;
  }

  .custom-marker {
    @apply rounded;
    @apply text-gray-700;
    @apply font-bold;
    @apply flex;
    @apply items-center;
    @apply justify-center;
    width: 25px !important;
    height: 20px !important;
  }

  .custom-marker-me {
    @apply border-none;
    width: 24px !important;
    height: 24px !important;
    z-index: 118 !important;
  }

  .no-padding {
    padding: 0 !important;
  }

  h1 {
    @apply text-2xl;
  }

  h2 {
    font-size: 1.8em;
    margin-bottom: 10px;
  }

  a {
    color: #ff4081;
  }

  .btn {
    @apply rounded-full;
    @apply flex;
    @apply items-center;
    @apply transition;
    @apply duration-300;
    @apply ease-in-out;

    &-link {
      color: #ff4081;
    }

    &-primary {
      background: #009688;
      @apply text-white;
    }

    &-accent {
      background: #ff4081;
      @apply text-white;
    }

    &-white {
      background: #ffffff;
      @apply shadow;
      color: #205164;
    }

    &-lg {
      @apply px-6;
      @apply py-2;

      @media (max-width: 1024px) {
        @apply px-5;
      }
    }

    &-xl {
      @apply px-12;
      @apply py-3;
      @apply text-lg;
      @apply font-semibold;

      @media (max-width: 1024px) {
        @apply px-5;
        @apply py-2;
      }
    }
  }

  button {
    &.disabled {
      background-color: #f7f7f7;
      color: #a5a5a5;
      @apply cursor-not-allowed;

      &:hover {
        background-color: #cccccc;
        @apply text-white;
      }
    }
    &:focus {
      outline: none !important;
    }
  }

  .button-group {
    @apply inline-flex;
    border: 1px solid #cbd5e0;
    @apply rounded;

    button {
      @apply bg-white;
      @apply w-full;
      @apply font-semibold;
      @apply py-2;
      @apply px-4;
      @apply justify-center;

      &:hover {
        @apply bg-gray-200;
      }

      &.selected {
        @apply bg-accent;
      }

      &:first-child {
        @apply rounded-l;
      }

      &:last-child {
        @apply rounded-r;
      }

      &:not(:last-child) {
        border-right: 1px solid #cbd5e0;
      }
    }
  }

  .details-panel {
    width: 350px;
  }

  .form-control {
    @apply flex;
    @apply flex-wrap;
    @apply mb-3;

    label {
      @apply block;
      @apply uppercase;
      @apply tracking-wide;
      @apply text-normal;
      @apply text-xs;
      @apply font-bold;
      @apply mb-2;
    }
  }

  input,
  select,
  textarea {
    @apply bg-white;
    @apply border;
    @apply border-gray-400;
    @apply border-solid;
    @apply py-3;
    @apply px-4;
    @apply font-semibold;
    @apply leading-tight;
    @apply block;
    @apply w-full;
    @apply rounded-sm;

    &::-webkit-input-placeholder,
    &::-moz-placeholder,
    &:-ms-input-placeholder,
    &::placeholder {
      @apply font-normal;
      @apply text-gray-600;
    }

    &:focus,
    &:hover {
      @apply outline-none;
      @apply border-gray-500;
    }
  }

  input[type="radio"] {
    @apply w-auto;
    @apply inline-block;
  }

  main {
    top: 45px;
    height: calc(100% - 45px);
  }

  @media (min-width: 1024px) {
    main {
      top: 64px;
      margin-left: 200px; // la taille de la nav de gauche
      height: calc(100% - 64px);
    }
  }

  @media (max-width: 768px) {
    .details-panel {
      margin-top: 40px;

      &.active {
        width: 100%;
      }
    }

    .notyf {
      padding-top: 0;
    }
  }

  @media (max-width: 1024px) {
    .notyf {
      padding-top: 55px;
    }
  }

  @use postcss-preset-env;
  @use postcss-nested-ancestors;
  @use postcss-nested;

  .skeleton-box {
    position: relative;
    overflow: hidden;
    background-color: #e2e8f0;

    &::after {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      background-image: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0,
        rgba(255, 255, 255, 0.2) 20%,
        rgba(255, 255, 255, 0.5) 60%,
        rgba(255, 255, 255, 0)
      );
      animation: shimmer 1s infinite;
      content: "";
    }
  }

  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }

  .mobile-overflow-hidden {
    @media (min-width: 1023px) {
      width: calc(100% - 200px);
    }

    @media (max-width: 1024px) {
      overflow: hidden;
    }
  }
</style>
