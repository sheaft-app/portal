<script>
  import { getContext } from "svelte";
  import Icon from "svelte-awesome";
  import { faEdit } from "@fortawesome/free-solid-svg-icons";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import GetAuthInstance from "./../../services/SheaftAuth.js";
  import UpdateImage from "./UpdateImage.svelte";
  import { UPDATE_USER_PICTURE, EXPORT_DATA } from "./mutations.js";
  import { authUserAccount } from "./../../stores/auth.js";
  import ConfirmDeleteAccount from "./ConfirmDeleteAccount.svelte";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  import EditConsumer from "./EditConsumer.svelte";
  import EditProducer from "./EditProducer.svelte";
  import EditStore from "./EditStore.svelte";
  import { config } from "../../configs/config";

	const errorsHandler = new SheaftErrors();
  const authInstance = GetAuthInstance();
  const { mutate } = getContext("api");
  const { open } = getContext("modal");

  let isLoading = false;
  let isSendingGPDRRequest = false;
  let hasSentGPDRRequest = false;

  const handleExport = async () => {
    isSendingGPDRRequest = true;
    await mutate({
			mutation: EXPORT_DATA,
			variables: {id: $authUserAccount.profile.id},
			errorsHandler,
			errorNotification: "Impossible d'exporter vos données RGPD, veuillez réessayer ultérieurement."
    });
    hasSentGPDRRequest = true;
  };

  const updateImage = () => open(UpdateImage, {
    id: $authUserAccount.profile.id,
    initialSrc: $authUserAccount.profile.picture,
    mutation: UPDATE_USER_PICTURE,
    onClose: async () => await authInstance.refreshLogin()
  });

  const showRemoveConfirmation = () => open(ConfirmDeleteAccount, {
      onClose: async () => await authInstance.logout()
  });

  const isInRole = (role) => authInstance.isInRole(role);

  $: picture =
    $authUserAccount &&
    $authUserAccount.profile &&
    $authUserAccount.profile.picture
      ? $authUserAccount.profile.picture
      : config.content + "/pictures/users/profile.svg";
</script>

<svelte:head>
  <title>Mon profil</title>
</svelte:head>

<TransitionWrapper classNames="m-auto">
  <section
    class="mb-4 pb-2 md:mb-6 md:pb-4 border-b border-gray-400 border-solid">
    <div class="flex flex-wrap items-center relative justify-between">
      <div class="flex flex-wrap items-center">
        <div class="mr-4 md:mb-0">
          <div
            on:click={() => updateImage()}
            style="background: url('{picture}'); background-size: cover;
            background-position: center; width: 4em; height: 4em"
            class="flex justify-end rounded-full bg-black shadow cursor-pointer">
              <button style="height: 25px; width:25px;" class="bottom-0 absolute text-xs text-white mt-6 shadow rounded-full bg-accent px-1"><Icon scale=".9" data={faEdit} /></button>
            </div>
        </div>
        <h1 class="text-2xl mb-0">Mon profil</h1>
      </div>
    </div>
  </section>
  <ErrorCard {errorsHandler} />
  {#if isInRole("CONSUMER")}
    <EditConsumer {errorsHandler} />
  {:else if isInRole("PRODUCER")}
    <EditProducer {errorsHandler} />
  {:else if isInRole("STORE")}
    <EditStore {errorsHandler} />
  {:else}
    Aucune donnée modifiable
  {/if}
  <section class="mb-6">
    <hr class="mt-10 mb-5" />
    <div>
      <p class="uppercase font-semibold text-lg mb-1">
        Télécharger mes données
      </p>
      <p>
        Vous pouvez obtenir une copie des informations collectées par notre
        application (soit vos nom, prénom, nombre de points,
        commandes et avis) en cliquant sur le bouton ci-dessous.
      </p>
      <button
        class="btn bg-white px-4 py-2 shadow mt-3 font-semibold
        hover:bg-gray-100"
        class:disabled={isSendingGPDRRequest ||hasSentGPDRRequest}
        disabled={isSendingGPDRRequest || hasSentGPDRRequest}
        on:click={() => handleExport()}>
        Je demande une copie de mes données
      </button>
      {#if hasSentGPDRRequest}
        <p class="text-green-500 mt-1">Votre demande a bien été envoyée. Vous recevrez une copie de vos données par mail sous 48h.</p>
      {/if}
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
</TransitionWrapper>
