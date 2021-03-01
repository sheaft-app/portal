<script>
  import { onMount, onDestroy } from "svelte";
  import NotificationsPanel from "./../notifications/NotificationsPanel.svelte";
  import {
    notificationsCount,
    displayNotificationCenter
  } from "./../notifications/store.js";
  import Icon from "svelte-awesome";
  import { clickOutside } from "./../../helpers/events";
  import { goToHome } from "./../../helpers/navigation";
  import {
    faQuestionCircle,
    faBars,
    faChevronLeft,
    faBell,
    faSignOutAlt
  } from "@fortawesome/free-solid-svg-icons";
  import NavLink from "./NavLink.svelte";
  import { slide } from "svelte/transition";
  import { selectedItem } from "./../../stores/app.js";
  import cartStore from "./../../stores/cart";
  import { navExpended, userMenuExpended } from "./store.js";
  import { authAuthenticated, authUserAccount, authRegistered } from "./../../stores/auth.js";
  import GetAuthInstance from "./../../services/SheaftAuth";
  import GetRouterInstance from "./../../services/SheaftRouter";
  import { openHelpModal } from "./../../services/SheaftFreshdesk";
  import AccountRoutes from "./../../routes/account/routes";
  import CartRoutes from "./../../routes/cart/routes";
  import Roles from "./../../enums/Roles";

  import ProductRoutes from "./../../routes/products/routes.js";
  import JobRoutes from "./../../routes/jobs/routes.js";
  import SearchStoreRoutes from "./../../routes/search-stores/routes.js";
  import SearchProducerRoutes from "./../../routes/search-producers/routes.js";
  import AgreementRoutes from "./../../routes/agreements/routes.js";
  import ReturnableRoutes from "./../../routes/returnables/routes.js";
  import SponsorshipRoutes from "./../../routes/sponsorship/routes.js";
  import LeaderboardRoutes from "./../../routes/leaderboard/routes.js";
  import SearchProductRoutes from "./../../routes/search-products/routes.js";
  import PurchaseOrderRoutes from "./../../routes/purchase-orders/routes.js";
  import MyOrderRoutes from "./../../routes/my-orders/routes.js";
  import SellingPointRoutes from "./../../routes/selling-points/routes.js";
  import DeliveryRoutes from "./../../routes/deliveries/routes.js";
  import QuickOrderRoutes from "./../../routes/quick-orders/routes.js";
import { config } from "../../configs/config";

  const authInstance = GetAuthInstance();
  const routerInstance = GetRouterInstance();

  $: isOwner = rls => {
    return authInstance.isInRole([Roles.Owner.Value]);
  };

  $: isInRole = (user, roles) => {
    return authInstance.isInRole(roles);
  };

  var popStateListener = (event) => {
    if ($navExpended) {
      return navExpended.set(false);
    }
  }

  $: if ($navExpended) { 
    history.pushState({ expanded: { nav: $navExpended }}, "Menu"); 
  }

  onMount(() => {
    window.addEventListener("popstate", popStateListener, false);
  })

  onDestroy(() => {
    window.removeEventListener("popstate", popStateListener, false);
  })
</script>

<div
  id="navbar"
  class="bg-primary w-full py-2 fixed top-0 flex md:px-6 lg:px-8
  items-center top-nav lg:justify-between
  {!$selectedItem && !($authRegistered && isInRole($authUserAccount, [Roles.Consumer.Value, Roles.Producer.Value, Roles.Store.Value])) ? 'justify-end': 'justify-between'}"
  style="z-index: 6;">
  {#if $displayNotificationCenter}
    <NotificationsPanel />
  {/if}
  {#if $userMenuExpended}
    <div
      transition:slide
      use:clickOutside={document.getElementById('user-badge')}
      on:click_outside={() => {
        userMenuExpended.set(false);
      }}
      class="fixed bg-white w-full shadow-lg lg:h-auto h-full lg:w-64
      rounded-b-lg right-0 user-panel">
      <hr />
      <a
        class="px-4 block hover:bg-gray-100 py-3 text-normal"
        href="javascript:void(0)"
        on:click={() => {
          userMenuExpended.set(false);
          routerInstance.goTo(AccountRoutes.Profile);
        }}>
        <Icon
          data={AccountRoutes.Profile.Icon}
          class="inline mr-4 md:mr-1 w-4"
          scale="0.9" />
        {AccountRoutes.Profile.Name}
      </a>
      <hr />
      <button
        on:click={() => {
          userMenuExpended.set(false);
          authInstance.logout();
        }}
        class="px-4 block text-left w-full hover:bg-gray-100 rounded-b-lg py-3
        text-normal">
        <Icon data={faSignOutAlt} class="inline mr-4 md:mr-1 w-4" scale="0.9" />
        Déconnexion
      </button>
    </div>
  {/if}
  <div
    class="hidden lg:flex items-center justify-center -ml-8"
    style="min-width: 200px;">
    <a href="javascript:void(0)"
    on:click={() => goToHome(authInstance, routerInstance)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style="width:150px;height:auto;"
        viewBox="0 0 901.44 220.01">
        <defs>
          <style>
            .cls-1,
            .cls-4 {
              fill: none;
            }
            .cls-1,
            .cls-3,
            .cls-4,
            .cls-5 {
              stroke: #fff;
            }
            .cls-1,
            .cls-3,
            .cls-4 {
              stroke-linecap: round;
            }
            .cls-1,
            .cls-5 {
              stroke-miterlimit: 10;
            }
            .cls-1 {
              stroke-width: 12px;
            }
            .cls-2,
            .cls-3,
            .cls-5 {
              fill: #fff;
            }
            .cls-3,
            .cls-4 {
              stroke-linejoin: round;
              stroke-width: 3px;
            }
            .cls-5 {
              stroke-width: 5px;
            }
          </style>
        </defs>
        <title>LOGO_SHEAFT_V6_white</title>
        <g id="FEUILLES_V3" data-name="FEUILLES V3">
          <g id="FRAISE">
            <path
              class="cls-1"
              d="M174.32,162.12s52.51-.66,72.3-48.83c12.53-30.51,5.76-73.38-1.9-99.37"
              transform="translate(-42.35)" />
            <path
              class="cls-1"
              d="M243.68,11.68c-26.92-4.35-73.45-12-102.4,4.1C95.57,41.2,92.22,96,92.22,96"
              transform="translate(-42.35)" />
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
            d="M63.05,218.51c-6-73.94,41.35-65.24,51.14-62.67,1.12.29-21.11,13-4.84,39C119.77,211.43,69.7,207.26,63.05,218.51Z"
            transform="translate(-42.35)" />
          <path
            class="cls-3"
            d="M49.55,97.41c-.9,43.29,34,25.45,34,25.45C66.83,120.72,55.82,104.07,49.55,97.41Z"
            transform="translate(-42.35)" />
          <path
            class="cls-2"
            d="M131.61,209.55c-41-31.1-10.85-52-10.85-52C151.81,173.75,127.34,198.13,131.61,209.55Z"
            transform="translate(-42.35)" />
          <path
            class="cls-4"
            d="M43.85,162.34c36.09-45.51,58.22-9.16,58.22-9.16C82.92,188.18,56.7,158.14,43.85,162.34Z"
            transform="translate(-42.35)" />
          <path
            class="cls-2"
            d="M165,207.88c-30.45-12-13.72-29.82-13.72-29.82C173.44,182.69,160.8,201.65,165,207.88Z"
            transform="translate(-42.35)" />
        </g>
        <g id="sheaft_vert_foncé" data-name="sheaft vert foncé">
          <path
            class="cls-5"
            d="M359,166.86a60.39,60.39,0,0,1-22.95-4.5,59.73,59.73,0,0,1-19.53-12.78l12.24-14.22a52.4,52.4,0,0,0,14.4,9.63,38.64,38.64,0,0,0,16.2,3.69q10.08,0,15.3-4.14a13.29,13.29,0,0,0,5.22-11,12.87,12.87,0,0,0-1.35-6.12,14,14,0,0,0-3.78-4.41,32.57,32.57,0,0,0-5.76-3.51q-3.33-1.62-7.29-3.24l-16.2-7a54.9,54.9,0,0,1-8.55-4.5,37.46,37.46,0,0,1-7.65-6.48,29.33,29.33,0,0,1-7.56-20.34,29.16,29.16,0,0,1,3-13,33.33,33.33,0,0,1,8.19-10.53,38.22,38.22,0,0,1,12.51-7,48.73,48.73,0,0,1,15.93-2.52,50.18,50.18,0,0,1,19.8,4,51.29,51.29,0,0,1,16.38,10.89L386.9,73.08A52.45,52.45,0,0,0,375,65.7,33.54,33.54,0,0,0,361.34,63c-5.64,0-10.14,1.24-13.5,3.69a11.92,11.92,0,0,0-5,10.17,10.73,10.73,0,0,0,1.53,5.85A15.65,15.65,0,0,0,348.47,87a33.15,33.15,0,0,0,6,3.42c2.28,1,4.62,2,7,3l16,6.66a55.87,55.87,0,0,1,9.54,5,35,35,0,0,1,7.47,6.66,29,29,0,0,1,4.95,8.73,33.4,33.4,0,0,1,1.8,11.43,31.91,31.91,0,0,1-11.25,24.57,41.08,41.08,0,0,1-13.32,7.56A52.61,52.61,0,0,1,359,166.86Z"
            transform="translate(-42.35)" />
          <path
            class="cls-5"
            d="M429,164.7V47H449.9V94.32h47.7V47h20.88V164.7H497.6V112.5H449.9v52.2Z"
            transform="translate(-42.35)" />
          <path
            class="cls-5"
            d="M554.66,164.7V47h70.92V64.62h-50V94.68h42.3v17.64h-42.3v34.74h51.84V164.7Z"
            transform="translate(-42.35)" />
          <path
            class="cls-5"
            d="M642.5,164.7,680.84,47h24.48L743.66,164.7h-22l-9.18-31.86h-39.6l-9.18,31.86Zm39.42-62.64-4.14,14.4h30.06l-4.14-14.4q-2.88-9.34-5.49-19.26t-5.13-19.62h-.72q-2.52,9.92-5,19.71T681.92,102.06Z"
            transform="translate(-42.35)" />
          <path
            class="cls-5"
            d="M764.54,164.7V47h71.1V64.62H785.42v33.3h42.84v17.64H785.42V164.7Z"
            transform="translate(-42.35)" />
          <path
            class="cls-5"
            d="M886.4,164.7V64.62h-34V47H941.3V64.62h-34V164.7Z"
            transform="translate(-42.35)" />
        </g>
      </svg>
    </a>
  </div>
  {#if $selectedItem || $navExpended}
    <button
      on:click={() => {
        navExpended.set(false);
        selectedItem.set(null);
      }}
      aria-label="Retour"
      class="inline-block lg:hidden py-2 px-4">
      <Icon data={faChevronLeft} class="inline" scale="1.2" />
    </button>
  {:else}
    <button
      on:click={() => {
        userMenuExpended.set(false);
        displayNotificationCenter.set(false);
        navExpended.set(!$navExpended);
      }}
      aria-label="Activer la navigation"
      class="inline-block lg:hidden py-2 px-4"
      class:hidden={!($authRegistered && isInRole($authUserAccount, [Roles.Consumer.Value, Roles.Producer.Value, Roles.Store.Value]))}>
      <Icon data={faBars} class="inline" scale="1.2" />
    </button>
  {/if}
  <div class="justify-end inline-flex lg:items-center">
    {#if !cartStore.getIsEmpty() && isInRole($authUserAccount, [
        Roles.Consumer.Value
      ])}
      <button
        on:click={() => {
          userMenuExpended.set(false);
          displayNotificationCenter.set(false);
          navExpended.set(false);
          routerInstance.goTo(CartRoutes.Resume);
        }}
        aria-label={CartRoutes.Resume.Name}
        class="flex uppercase text-white mr-6 md:mx-6 items-center">
        <Icon data={CartRoutes.Resume.Icon} scale="1.2" />
        <span
          class="absolute rounded-full bg-accent text-white"
          style="padding: 0px 5px; font-size: 11px; margin-top: -7px; margin-left: 10px;">
          {cartStore.getTotalProductsCount()}
        </span>
      </button>
    {/if}
    <button
      on:click={() => {
        userMenuExpended.set(false);
        displayNotificationCenter.set(false);
        navExpended.set(false);
        openHelpModal();
      }}
      aria-label="Afficher l'aide"
      class="uppercase text-white mr-4 md:mr-4 flex items-center">
      <Icon data={faQuestionCircle} class="mr-3 inline" scale="1.2" />
    </button>
    {#if $authAuthenticated}
      <button
        on:click={() => {
          userMenuExpended.set(false);
          navExpended.set(false);
          displayNotificationCenter.set(!$displayNotificationCenter);
        }}
        aria-label="Afficher les notifications"
        class="flex uppercase text-white mr-4 md:mr-4 items-center"
        class:hidden={!($authRegistered && isInRole($authUserAccount, [Roles.Consumer.Value, Roles.Producer.Value, Roles.Store.Value]))}>
        <Icon data={faBell} class="mr-3 inline" scale="1.2" />
        {#if $notificationsCount > 0}
          <span
            class="absolute rounded-full bg-accent text-white"
            style="padding: 0px 5px; font-size: 11px; margin-top: -7px; margin-left: 10px;">
            {$notificationsCount}
          </span>
        {/if}
      </button>
      <button
        id="user-badge"
        on:click={() => {
          navExpended.set(false);
          displayNotificationCenter.set(false);
          userMenuExpended.set(!$userMenuExpended);
        }}
        class="rounded-full shadow bg-white px-2 lg:px-5 py-1 inline-flex
        items-center text-semibold focus:outline-none mr-4">
        <span class="text-sm lg:text-base text-normal">
          {$authUserAccount.profile.given_name ? $authUserAccount.profile.given_name : $authUserAccount.profile.name}
        </span>
        <div
          style="background-image: url('{$authUserAccount.profile.picture ? $authUserAccount.profile.picture : config.content + "/pictures/users/profile.svg"}');"
          class="rounded-full bg-white user-photo ml-2 w-5 h-5 lg:w-8 lg:h-8" />
      </button>
    {:else}
      <button
        on:click={() => {
          userMenuExpended.set(false);
          displayNotificationCenter.set(false);
          navExpended.set(false);
          authInstance.login();
        }}
        class="inline px-6 bg-white text-center hover:bg-gray-100 rounded-full
        py-1 lg:py-2 text-normal font-semibold mr-4">
        Se connecter
      </button>
    {/if}
  </div>
</div>

<nav
  class="nav fixed content-between overflow-hidden"
  class:hidden={!($authRegistered && isInRole($authUserAccount, [Roles.Consumer.Value, Roles.Producer.Value, Roles.Store.Value]))}
  class:active={$navExpended}>
  <div class="w-full">
    <ul class="nav__menu">
      {#if !$authAuthenticated || $authRegistered && isInRole($authUserAccount, [
          Roles.Consumer.Value
        ])}
        <NavLink route={SearchProductRoutes.Search} />
        <NavLink route={CartRoutes.Resume} />
      {/if}
      {#if $authRegistered && isInRole($authUserAccount, [Roles.Consumer.Value])}
        <NavLink route={MyOrderRoutes.List} />
      {/if}
      {#if $authRegistered && isInRole($authUserAccount, [Roles.Store.Value])}
        <NavLink route={QuickOrderRoutes.Purchase} />
        <NavLink route={MyOrderRoutes.List} />
        <NavLink route={SearchProducerRoutes.Search} />
        <NavLink route={AgreementRoutes.List} />
        <NavLink route={JobRoutes.List} />
      {/if}
      {#if $authRegistered && isInRole($authUserAccount, [Roles.Producer.Value])}
        <NavLink route={ProductRoutes.List} />
        <NavLink route={PurchaseOrderRoutes.List} />
        <NavLink route={ReturnableRoutes.List} />
        <NavLink route={SellingPointRoutes.List} />
        <NavLink route={DeliveryRoutes.List} />
        <NavLink route={SearchStoreRoutes.Search} />
        <NavLink route={AgreementRoutes.List} />
        <NavLink route={JobRoutes.List} />
      {/if}
      <!-- {#if !$authAuthenticated || $authRegistered && isInRole($authUserAccount, [
          Roles.Consumer.Value
        ])}
        <NavLink route={LeaderboardRoutes.Country} />
      {/if} -->
      <!-- {#if $authAuthenticated && $authRegistered}
        <NavLink route={SponsorshipRoutes.Share} />
      {/if} -->
    </ul>
  </div>
</nav>

<style lang="scss">
  .username {
    top: -25px;
  }

  .user-photo {
    background-size: cover; 
    background-position: center;
  }

  .nav {
    z-index: 5;
    width: 200px;
    padding-top: 64px;
    height: 100vh;
    background-color: #fbfbfb;
    transition: all 0.13s linear;

    &__app {
      margin-bottom: 45px;

      &__name {
        font-size: 2rem;
        font-weight: 500;
      }

      &__brand-name {
        font-size: 1rem;
      }
    }
  }

  .top-nav {
    height: 64px;
  }

  .user-panel {
    top: 64px;
  }

  @media (max-width: 1023px) {
    .username {
      top: -80px;
    }

    .user-panel {
      top: 45px;
    }

    .top-nav {
      height: 45px;
    }

    .nav {
      position: absolute;
      transform: translateX(-270px);
      box-shadow: none;
      padding-top: 45px;

      + div {
        @apply px-3;
      }

      &.active {
        width: 100%;
        transform: translateX(0px);
      }
    }
  }
</style>
