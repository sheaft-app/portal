<script>
  import Router from "svelte-spa-router";

  import EditCompany from "./company/EditCompany.svelte";
  import EditProfile from "./profile/EditProfile.svelte";
  import GetAuthInstance from "./../../services/SheaftAuth.js";
  import AccountRoutes from "./routes.js";

  export let params = {};

  export const prefix = AccountRoutes.Prefix;

  const routes = {};
  routes[AccountRoutes.Company.SubPart] = EditCompany;
  routes[AccountRoutes.Profile.SubPart] = EditProfile;

</script>

<Router {routes} {prefix} />

<style lang="scss">
  .account-menu div {
    @apply mb-6;
    @apply py-2;

    a {
      @apply rounded;
      @apply cursor-pointer;

      &:hover {
        color: #7dd6ba;
      }

      &.active {
        @apply text-white;
        background: linear-gradient(90deg, #33d7c3 0%, #33D7A3 100%);
      }
    }
  }
</style>
