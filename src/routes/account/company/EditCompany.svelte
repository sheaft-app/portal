<script>
  import UpdateImage from "./../UpdateImage.svelte";
  import { onMount, getContext } from "svelte";
  import Loader from "./../../../components/Loader.svelte";
  import Icon from "svelte-awesome";
  import { faCircleNotch, faCheck } from "@fortawesome/free-solid-svg-icons";
  import TransitionWrapper from "./../../../components/TransitionWrapper.svelte";
  import GetGraphQLInstance from "./../../../services/SheaftGraphQL.js";
  import GetAuthInstance from "./../../../services/SheaftAuth.js";
  import { UPDATE_COMPANY, UPDATE_COMPANY_PICTURE } from "./mutations.js";
  import { GET_COMPANY_DETAILS } from "./queries.js";
  import CitySearch from "./../../../components/search/CitySearch.svelte";
  import ErrorCard from "./../../../components/ErrorCard.svelte";
  import InputCheckbox from "./../../../components/controls/InputCheckbox.svelte";
  import SheaftErrors from "../../../services/SheaftErrors";

  const { open } = getContext("modal");
  const graphQLInstance = GetGraphQLInstance();
  const errorsHandler = new SheaftErrors();
  const authInstance = GetAuthInstance();

  let company = null;
  let isLoading = false;

  $: isValid =
    company &&
    company.name &&
    company.siret &&
    company.email &&
    company.address &&
    company.address.line1 &&
    company.address.city &&
    company.address.zipcode &&
    company.address.longitude &&
    company.address.latitude;

  onMount(async () => {
    await handleGet();
  });

  const handleGet = async () => {
    isLoading = true;
    var res = await graphQLInstance.query(GET_COMPANY_DETAILS, null, errorsHandler.Uuid);
    isLoading = false;

    if (!res.success) {
      //TODO
      return;
    }

    company = res.data;
  };

  const handleUpdate = async () => {
    isLoading = true;
    var res = await graphQLInstance.mutate(UPDATE_COMPANY, company, errorsHandler.Uuid);
    isLoading = false;

    if (!res.success) {
      //TODO
      return;
    }

    await authInstance.loginSilent();
  };

  const updateImage = () => {
    open(UpdateImage, {
      id: company.id,
      mutation: UPDATE_COMPANY_PICTURE,
      onClose: async res => {
        if (res.success) {
            company.picture = res.picture;
        }
      }
    });
  };

  $: picture =
    company && company.picture
      ? company.picture
      : "https://sheaftapp.blob.core.windows.net/pictures/companies%2Fstore.png";
</script>

<svelte:head>
  <title>Ma société</title>
</svelte:head>

<TransitionWrapper>
  {#if isLoading}
    <Loader />
  {:else}
    <section
      class="mb-4 pb-2 md:mb-6 md:pb-4 border-b border-gray-400 border-solid">
      <div class="flex flex-wrap items-center relative justify-between">
        <div class="flex flex-wrap items-center">
          <div class="mr-4 md:mb-0">
            <div
              on:click={() => updateImage()}
              style="background: url('{picture}'); background-size: cover;
              background-position: center; width: 4em; height: 4em"
              class="rounded-full bg-black shadow cursor-pointer" />
          </div>
          <h1 class="text-2xl mb-0">Ma société</h1>
        </div>
      </div>
    </section>
    <ErrorCard {errorsHandler} />
    {#if company}
      <form class="w-full" on:submit|preventDefault={() => handleUpdate()}>
        <input hidden required name="city" bind:value={company.address.city} />
        <input
          hidden
          required
          name="zipcode"
          bind:value={company.address.zipcode} />
        <input hidden required name="line1" bind:value={company.address.line1} />
        <input
          hidden
          required
          name="latitude"
          bind:value={company.address.latitude} />
        <input
          hidden
          required
          name="longitude"
          bind:value={company.address.longitude} />
        <div class="form-control">
          <div class="w-full md:w-1/3 pr-0 md:pr-2 mb-3 md:mb-0">
            <label for="grid-name">Nom *</label>
            <input
              bind:value={company.name}
              required
              id="grid-name"
              type="text" />
          </div>
          <div class="w-full md:w-2/3">
            <label for="grid-siret">Numéro SIRET *</label>
            <input
              bind:value={company.siret}
              required
              maxlength="9"
              id="grid-siret"
              type="text" />
          </div>
        </div>
        <div class="form-control">
          <div class="w-full">
            <label for="grid-vat">Numéro de TVA</label>
            <input
              bind:value={company.vatIdentifier}
              id="grid-vat"
              maxlength="12"
              type="text" />
          </div>
        </div>
        <div class="form-control">
          <div class="w-full md:w-1/2 pr-0 md:pr-2 mb-3 md:mb-0">
            <label for="grid-mail">Email *</label>
            <input
              bind:value={company.email}
              required
              id="grid-mail"
              type="email"
              placeholder="contact@test.com" />
          </div>
          <div class="w-full md:w-1/2">
            <label for="grid-phone">Téléphone</label>
            <input
              bind:value={company.phone}
              id="grid-phone"
              type="tel"
              placeholder="XX XX XX XX XX" />
          </div>
        </div>
        <div class="my-6" />
        <div class="form-control" style="display: block;">
          <label for="grid-line1">Adresse *</label>
          <CitySearch bind:selectedAddress={company.address} />
        </div>
        <div class="form-control">
          <div class="w-full md:w-2/2">
            <label for="grid-line2">Complément d'adresse</label>
            <input
              bind:value={company.address.line2}
              id="grid-line"
              type="text"
              placeholder="Bâtiment B n°113" />
          </div>
        </div>
        <div class="my-6" />
        <div class="form-control">
          <div class="w-full md:w-2/2">
            <label for="grid-line2">Description</label>
            <textarea
              bind:value={company.description}
              id="grid-line"
              type="text"
              placeholder="Cette description sera visible par tous les
              consommateurs (optionnel)" />
          </div>
        </div>
        <div class="mt-2">
          <div class="mb-2">
            <label class="cursor-pointer">
              <InputCheckbox
                checked={company.appearInBusinessSearchResults}
                onClick={() => (company.appearInBusinessSearchResults = !company.appearInBusinessSearchResults)} />
              Visible dans la recherche pour les professionnels de la distribution
            </label>
          </div>
        </div>
        <div class="justify-end form-control mt-5">
          <button
            type="submit"
            class:disabled={isLoading || !isValid}
            disabled={isLoading || !isValid}
            class="btn btn-lg btn-primary w-full md:w-auto justify-center">
            <Icon
              data={isLoading ? faCircleNotch : faCheck}
              class="mr-1 inline"
              spin={isLoading} />
            Valider
          </button>
        </div>
      </form>
    {/if}
  {/if}
</TransitionWrapper>
