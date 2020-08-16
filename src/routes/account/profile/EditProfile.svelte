<script>
  import Loader from "./../../../components/Loader.svelte";
  import { onMount, getContext } from "svelte";
  import Icon from "svelte-awesome";
  import { faCircleNotch, faCheck } from "@fortawesome/free-solid-svg-icons";
  import TransitionWrapper from "./../../../components/TransitionWrapper.svelte";
  import GetAuthInstance from "./../../../services/SheaftAuth.js";
  import GetGraphQLInstance from "./../../../services/SheaftGraphQL.js";
  import UpdateImage from "./../UpdateImage.svelte";
  import { UPDATE_ME, UPDATE_USER_PICTURE, EXPORT_DATA } from "./mutations.js";
  import { GET_ME_DETAILS } from "./queries.js";
  import { authUserAccount } from "./../../../stores/auth.js";
  import ConfirmDeleteAccount from "./ConfirmDeleteAccount.svelte";
  import SheaftErrors from "../../../services/SheaftErrors";
  import ErrorCard from "./../../../components/ErrorCard.svelte";

  const errorsHandler = new SheaftErrors();
  const authInstance = GetAuthInstance();
  const graphQLInstance = GetGraphQLInstance();
  const { open } = getContext("modal");

  let user = null;
  let isLoading = false;

  $: isValid = user && user.firstName && user.lastName && user.email;

  const handleGet = async () => {
    isLoading = true;
    var res = await graphQLInstance.query(GET_ME_DETAILS, null, errorsHandler.Uuid);
    isLoading = false;

    if (!res.success) {
      //TODO
      return;
    }

    user = res.data;
  };

  const handleUpdate = async () => {
    isLoading = true;
    const userSanitized = user;
    delete userSanitized['anonymous'];

    var res = await graphQLInstance.mutate(UPDATE_ME, { ...userSanitized }, errorsHandler.Uuid);
    isLoading = false;

    if (!res.success) {
      //TODO
      return;
    }

    await authInstance.loginSilent();
  };

  const handleExport = async () => {
    var res = await graphQLInstance.mutate(EXPORT_DATA, { id: user.id }, errorsHandler.Uuid);
    if (!res.success) {
      //TODO
      return;
    }
  };

  const updateImage = () => {
    open(UpdateImage, {
      id: user.id,
      mutation: UPDATE_USER_PICTURE,
      onClose: async res => {
        if (res.success) await authInstance.loginSilent();
      }
    });
  };

  const showRemoveConfirmation = () => {
    open(ConfirmDeleteAccount, {
      onClose: async res => {
        if (res.success) await authInstance.logout();
      }
    });
  };

  onMount(async () => {
    await handleGet();
  });

  $: picture =
    $authUserAccount &&
    $authUserAccount.profile &&
    $authUserAccount.profile.picture
      ? $authUserAccount.profile.picture
      : "https://sheaftapp.blob.core.windows.net/pictures/users/profile.svg";
</script>

<svelte:head>
  <title>Mon profil</title>
</svelte:head>

<TransitionWrapper>
  {#if !user}
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
          <h1 class="text-2xl mb-0">Mon profil</h1>
        </div>
      </div>
    </section>
    <ErrorCard {errorsHandler} />
    <form class="w-full" on:submit|preventDefault={() => handleUpdate()}>
      <div class="form-control">
        <div class="w-full md:w-2/4 pr-0 md:pr-2 mb-3 md:mb-0">
          <label for="grid-first-name">Prénom *</label>
          <input
            bind:value={user.firstName}
            required
            id="grid-first-name"
            type="text"
            placeholder="Jean" />
        </div>
        <div class="w-full md:w-2/4">
          <label for="grid-last-name">Nom *</label>
          <input
            bind:value={user.lastName}
            required
            type="text"
            placeholder="Dupont" />
        </div>
      </div>
      <div class="form-control">
        <div class="w-full md:w-3/3">
          <label for="grid-email">Email *</label>
          <input
            bind:value={user.email}
            required
            id="grid-email"
            type="email"
            placeholder="jean.dupont@test.xyz" />
        </div>
      </div>
      <div class="form-control">
        <div class="w-full md:w-1/2">
          <label for="grid-phone">Téléphone</label>
          <input
            bind:value={user.phone}
            id="grid-phone"
            type="tel"
            placeholder="XX XX XX XX XX" />
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
    <section class="mb-6">
      <hr class="mt-10 mb-5" />
      <div>
        <p class="uppercase font-semibold text-lg mb-1">
          Télécharger mes données
        </p>
        <p>
          Vous pouvez obtenir une copie des informations collectées par notre
          applications soit votre nom, prénom, votre nombre de points, vos
          commandes et vos recherches en cliquant sur le bouton ci-dessous.
        </p>
        <button
          class="btn bg-white px-4 py-2 shadow mt-3 font-semibold
          hover:bg-gray-100"
          on:click={handleExport}>
          Je demande une copie de mes données
        </button>
      </div>
      <hr class="mt-10 mb-5" />
      <div>
        <p class="uppercase font-semibold text-lg mb-1">Supprimer mon compte</p>
        <p>
          Si vous souhaitez supprimer votre compte, vous pouvez cliquer sur le
          bouton ci-dessous. Veuillez noter que la suppression de votre compte
          implique la perte irréversible de vos commandes et de vos points.
        </p>
        <button
          on:click={() => {
            showRemoveConfirmation();
          }}
          class:disabled={isLoading}
          disabled={isLoading}
          class="btn bg-red-500 px-4 py-2 shadow mt-3 font-semibold text-white">
          Supprimer mon compte
        </button>
      </div>
    </section>
  {/if}
</TransitionWrapper>
