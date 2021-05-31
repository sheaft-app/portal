<script>
	import Loader from './../../components/Loader.svelte';
  import { getContext, onMount } from "svelte";
  import TransitionWrapper from "../../components/TransitionWrapper.svelte";
  import Icon from "svelte-awesome";
  import { faShareAlt } from "@fortawesome/free-solid-svg-icons";
  import { faClipboard } from "@fortawesome/free-solid-svg-icons";
  import GetAuthInstance from "./../../services/SheaftAuth.js";
  import { GENERATE_USER_SPONSORING_CODE } from "./mutations.js";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";

  const errorsHandler = new SheaftErrors();
  const { mutate } = getContext("api");
  const auth = GetAuthInstance();

  let code = null;
  let copied = false;
  let link = null;
  let isLoading = true;

  onMount(async () => {
    isLoading = true;
    await mutate({
			mutation: GENERATE_USER_SPONSORING_CODE,
			variables: { id: auth.user.profile.id },
			errorsHandler,
			success: async (res) => {
        code = res;
        link = `${window.location.protocol}//${window.location.hostname}${
          window.location.port ? `:${window.location.port}` : ""
        }/#/register?sponsoring=${code}`;
      },
			errorNotification: "Impossible de récupérer votre code de parrainage."
    });
    isLoading = false;
  });

  const handleClick = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Sheaft - Consommer local, plus facilement",
          text:
            "Découvrez et commandez en quelques clics des produits de qualité issus de la production locale.",
          url: link
        })
        .catch(error => console.error("Error sharing", error));
    } else {
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link);
    copied = true;
  };
</script>

<TransitionWrapper>
  <div class="h-full">
    <ErrorCard {errorsHandler} />
    {#if isLoading}
        <Loader />
    {:else if code}
      <div class="text-center">
        <img
          src="/img/gift.svg"
          class="m-auto"
          style="width: 200px;"
          alt="Cadeaux !" />
        <p class="mt-5 font-semibold">
          Partagez ce code et gagnez des points pour chaque personne recrutée !
        </p>
        <div class="mt-6 mb-6">
          <span
            class="px-6 py-3 uppercase border border-gray-400 font-semibold
            text-2xl bg-green-100">
            {code}
          </span>
        </div>
        <p class="mb-5 font-semibold">ou utilisez ce lien à partager partout</p>
        {#if navigator.share}
          <button
            on:click={() => handleClick()}
            class="btn btn-primary btn-lg mt-3 m-auto">
            <Icon data={faShareAlt} class="mr-2" />
            Partager
          </button>
        {:else}
          <div class="flex flex-wrap justify-center">
            <span
              id="link"
              class="w-full md:w-auto px-4 py-2 border border-gray-400 mb-2 mr-0
              md:mb-0 md:mr-2">
              {link}
            </span>
            {#if copied}
              <span class="btn px-6 py-2">
                <Icon data={faClipboard} class="mr-2" />
                Copié !
              </span>
            {:else}
              <button
                class="btn btn-accent px-6 py-2"
                style="transition: none !important;"
                on:click={() => copyToClipboard()}>
                <Icon data={faClipboard} class="mr-2" />
                Copier
              </button>
            {/if}
          </div>
        {/if}
        <p class="text-gray-600 text-sm mt-3">
          Les points seront crédités sur votre compte lorsque la personne aura
          validé le code à l'inscription.
        </p>
      </div>
    {:else}
      <div>
        <p>
          Impossible d'afficher votre code de parainage, veuillez rafraichir la
          page ou contacter notre support.
        </p>
      </div>
    {/if}
  </div>
</TransitionWrapper>
