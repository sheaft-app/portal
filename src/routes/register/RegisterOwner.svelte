<script>
  import Loader from "./../../components/Loader.svelte";
  import { REGISTER_STORE, REGISTER_PRODUCER } from "./mutations.js";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import GetAuthInstance from "./../../services/SheaftAuth";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL";
  import SheaftErrors from "./../../services/SheaftErrors";
  import GetRouterInstance from "./../../services/SheaftRouter";
  import GetNotificationsInstance from "./../../services/SheaftNotifications";
  import { normalizeOpeningHours } from "./../../helpers/app";
  import { onMount } from "svelte";
  import Roles from "./../../enums/Roles";
  import ErrorCard from "../../components/ErrorCard.svelte";
  import { authRegistered } from "../../stores/auth";
  import ErrorContainer from "./../../components/ErrorContainer.svelte";
  import FormSiret from "./owner/FormSiret.svelte";
  import FormOwner from "./owner/FormOwner.svelte";
  import FormCompany from "./owner/FormCompany.svelte";
  import FormBusinessHours from "./owner/FormBusinessHours.svelte";
  import FormProductionSite from "./owner/FormProductionSite.svelte";

  export let params = {};

  const authInstance = GetAuthInstance();
  const routerInstance = GetRouterInstance();
  const graphQLInstance = GetGraphQLInstance();
  const notificationsInstance = GetNotificationsInstance();
  const errorsHandler = new SheaftErrors();

  let isRegistering = false;
  let addressForm = null;
  let showSponsoring = false;
  let stepper = 0;
  let vat = null;
  let sponsorshipCode = JSON.parse(localStorage.getItem("sponsoring"));
  let openings = [];
  let invalidSiret = false;

  let company = {
    name: authInstance.user.profile.name || null,
    openForNewBusiness: true,
    address: {
      line1: null,
      line2: null,
      city: null,
      zipcode: null
    },
    firstName: authInstance.user.profile.given_name || null,
    lastName: authInstance.user.profile.family_name || null,
    email: authInstance.user.profile.email || null,
    phone: authInstance.user.profile.phone || null,
    picture: authInstance.user.profile.picture || null,
    sponsoringCode: sponsorshipCode || null,
    legals: {
      vatIdentifier: null,
      siret: null,
      kind: null,
      email: authInstance.user.profile.email || null,
      address: {
        line1: null,
        line2: null,
        city: null,
        zipcode: null,
        country: null
      },
      owner: {
        firstName: null,
        lastName: null,
        email: authInstance.user.profile.email || null,
        birthDate: null,
        nationality: null,
        address: {
          line1: null,
          line2: null,
          city: null,
          zipcode: null,
          country: null
        }
      }
    }
  };

  const handleSubmit = async () => {
    addressForm.validate();

    if ($addressForm.valid) {
      if (vat) {
        company.legals.vatIdentifier = "FR" + vat + company.legals.siret.toString().substring(0, 9);
      }

      var register = null;
      if (isStore) {
        register = REGISTER_STORE;
        company.openingHours = normalizeOpeningHours(openings);
      } else {
        register = REGISTER_PRODUCER;
        delete company["openingHours"];
      }

      delete company.address['insee'];
      delete company.address['id'];

      const dateParts = company.legals.owner.birthDate.trim().split("/");

      isRegistering = true;
      var res = await graphQLInstance.mutate(register, {
        ...company,
        address: {
          ...company.address,
          country: "FR"
        },
        legals: {
          ...company.legals,
          siret: company.legals.siret.toString(),
          address: {
            ...company.legals.address,
            country: company.legals.address.country.code
          },
          owner: {
            ...company.legals.owner,
            address: {
              ...company.legals.owner.address,
              country: company.legals.owner.address.country.code
            },
            countryOfResidence: company.legals.owner.address.country.code,
            nationality: company.legals.owner.nationality.code,
            birthDate: new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
          }
        }
      }, errorsHandler.Uuid);

      if (!res.success) {
      isRegistering = false;
        //TODO
        return;
      }

      await authInstance.loginSilent();
      authRegistered.set(true);
      localStorage.removeItem("user_choosen_role");
      localStorage.removeItem("sponsoring");
      routerInstance.goTo("/");
      isRegistering = false;
    }
  };

  $: isStore = params.id == Roles.Store.Value;
</script>

<svelte:head>
  <title>Enregistrement société</title>
</svelte:head>

<TransitionWrapper>
  <div class="-my-2 -mx-4 py-2 overflow-x-auto mt-2 mb-8 h-full">
    <ErrorCard {errorsHandler}/>
    <div class="w-full md:w-3/5 lg:w-4/5 m-auto">
      {#if isRegistering}
        <Loader />
      {:else}
        {#if stepper <= 0}
          <FormSiret bind:company bind:stepper bind:invalidSiret />
        {:else if stepper == 1}
          <FormCompany bind:company {isStore} bind:vat bind:stepper {errorsHandler} {invalidSiret} />
        {:else if stepper == 2}
          <FormOwner bind:company {errorsHandler} bind:stepper />
        {:else if stepper == 3}
          <FormBusinessHours bind:company {isStore} bind:openings bind:stepper /> 
        {:else if stepper == 4}
          <FormProductionSite bind:company {isStore} bind:stepper bind:addressForm submit={handleSubmit} />
        {/if}
      {/if}
    </div>
  </div>
</TransitionWrapper>

<style>
img {
  height: 80px;
  width: 100%;
}
</style>