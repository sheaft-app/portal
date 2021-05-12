<script>
  import { onMount, onDestroy } from "svelte";
  import { fly } from "svelte/transition";

  let displayCookiePop = false;

  const handleSubmit = async (res) => {
    localStorage.setItem("user_cookies_consent", JSON.stringify(true));
    displayCookiePop = false;
  };

  onMount(() => {
    var cookieConsent = JSON.parse(
      localStorage.getItem("user_cookies_consent")
    );

    if (cookieConsent == null) {
      displayCookiePop = true;
      return;
    }
  });
</script>

{#if displayCookiePop}
  <div transition:fly={{ y: 200 }} class="fixed bottom-0 w-full bg-white border-t border-gray-400 px-4 lg:px-16 py-6 flex flex-wrap justify-between items-center" style="z-index: 100;">
    <div class="container m-auto">
      <div class="lg:w-8/12">
        <h2>Promis, nos cookies sont locaux !</h2>
        <p class="text-gray-600">
          Les cookies sont des données qui sont téléchargées ou stockées sur votre
          appareil.
          Nous les utilisons afin d’améliorer votre expérience sur notre site.
        </p>
        <p class="text-gray-600 mt-2">
          En cliquant sur ”J’accepte”, vous acceptez l’utilisation de ces cookies.
          Vous pourrez toujours les désactiver ultérieurement.
        </p>
      </div>
      <div class="flex flex-wrap lg:block mt-2 lg:w-3/12 w-full mx-auto">
        <button on:click={handleSubmit} class="btn btn-primary btn-lg m-auto mb-2 w-full justify-center">Accepter les cookies</button>
        <button on:click={() => displayCookiePop = false} class="btn bg-white btn-lg shadow m-auto w-full justify-center">Refuser les cookies</button>
      </div>
    </div>
  </div>
{/if}