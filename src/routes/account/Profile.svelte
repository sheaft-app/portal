<script>
  import Loader from "./../../components/Loader.svelte";
  import { onMount, getContext } from "svelte";
  import Icon from "svelte-awesome";
  import { faCircleNotch, faCheck } from "@fortawesome/free-solid-svg-icons";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import GetAuthInstance from "./../../services/SheaftAuth.js";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import UpdateImage from "./UpdateImage.svelte";
  import { UPDATE_USER_PICTURE, EXPORT_DATA } from "./mutations.js";
  import { authUserAccount } from "./../../stores/auth.js";
  import ConfirmDeleteAccount from "./ConfirmDeleteAccount.svelte";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  import EditConsumer from "./EditConsumer.svelte";
  import EditProducer from "./EditProducer.svelte";
  import EditStore from "./EditStore.svelte";

  const errorsHandler = new SheaftErrors();
  const authInstance = GetAuthInstance();
  const graphQLInstance = GetGraphQLInstance();
  const { open } = getContext("modal");

  let isLoading = false;
  let userId = $authUserAccount.profile.sub;

  const handleExport = async () => {
    var res = await graphQLInstance.mutate(EXPORT_DATA, { id: userId }, errorsHandler.Uuid);
    if (!res.success) {
      //TODO
      return;
    }
  };

  const updateImage = () => {
    open(UpdateImage, {
      id: userId,
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

  const isInRole = (role) => {
    return authInstance.isInRole(role);
  }

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
    {#if isInRole("CONSUMER")}
      <EditConsumer {errorsHandler} {userId} />
    {:else if isInRole("PRODUCER")}
      <EditProducer {errorsHandler} {userId} />
    {:else if isInRole("STORE")}
      <EditStore {errorsHandler} {userId} />
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
</TransitionWrapper>