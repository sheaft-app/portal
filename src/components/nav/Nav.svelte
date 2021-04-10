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
  import cart from "./../../stores/cart";
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
  import SheaftSvg from "./SheaftSvg.svelte";

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
      {#if $authRegistered && isInRole($authUserAccount, [Roles.Consumer.Value])}
        <a
          class="px-4 block hover:bg-gray-100 py-3 text-normal"
          href="javascript:void(0)"
          on:click={() => {
            userMenuExpended.set(false);
            routerInstance.goTo(MyOrderRoutes.List);
          }}>
          <Icon
            data={MyOrderRoutes.List.Icon}
            class="inline mr-4 md:mr-1 w-4"
            scale="0.9" />
          {MyOrderRoutes.List.Name}
        </a>
      {/if}
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
          displayNotificationCenter.set(false);
          navExpended.set(false);
          openHelpModal();
        }}
        aria-label="Afficher l'aide"
        class="px-4 block text-left w-full hover:bg-gray-100 rounded-b-lg py-3
        text-normal lg:hidden">
        <Icon data={faQuestionCircle} class="mr-3 inline" scale="1.2" />
        Voir l'aide
      </button>
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
    <button class="btn-link"
    on:click={() => goToHome(authInstance, routerInstance)}>
      <SheaftSvg width=150 />
    </button>
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
  {:else if !authInstance.isInRole([Roles.Consumer.Value])}
    <button
      on:click={() => {
        userMenuExpended.set(false);
        displayNotificationCenter.set(false);
        navExpended.set(!$navExpended);
      }}
      aria-label="Activer la navigation"
      class="inline-block lg:hidden py-2 px-4"
      class:hidden={!($authRegistered && isInRole($authUserAccount, [Roles.Producer.Value, Roles.Store.Value]))}>
      <Icon data={faBars} class="inline" scale="1.2" />
    </button>
  {:else}
    <button class="btn-link lg:hidden ml-5" on:click={() => goToHome(authInstance, routerInstance)}>
      <SheaftSvg width=100 />
    </button>
  {/if}
  <div class="justify-end inline-flex lg:items-center">
    {#if $cart.products.length > 0 && isInRole($authUserAccount, [
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
          {$cart.productsCount}
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
      class="uppercase text-white mr-1 md:mr-4 hidden lg:flex items-center">
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
        class="flex uppercase text-white mr-1 md:mr-4 items-center"
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

{#if $authRegistered && isInRole($authUserAccount, [Roles.Store.Value, Roles.Producer.Value])}
  <nav
    class="nav fixed content-between overflow-hidden"
    class:hidden={!($authRegistered && isInRole($authUserAccount, [Roles.Consumer.Value, Roles.Producer.Value, Roles.Store.Value]))}
    class:active={$navExpended}>
    <div class="w-full">
      <ul class="nav__menu">
        {#if isInRole($authUserAccount, [Roles.Store.Value])}
          <NavLink route={QuickOrderRoutes.Purchase} />
          <NavLink route={MyOrderRoutes.List} />
          <NavLink route={SearchProducerRoutes.Search} />
          <NavLink route={AgreementRoutes.List} />
          <NavLink route={JobRoutes.List} />
        {/if}
        {#if isInRole($authUserAccount, [Roles.Producer.Value])}
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
{/if}

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
