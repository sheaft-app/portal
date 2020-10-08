<script>
  import GetAuthInstance from "./../../services/SheaftAuth";
  import GetRouterInstance from "./../../services/SheaftRouter";
  import { goToHome } from "./../../helpers/navigation";

  const authInstance = GetAuthInstance();
  const routerInstance = GetRouterInstance();
</script>

<svelte:head>
  <title>Pas de connexion</title>
</svelte:head>

<div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
  <div
    class="text-gray-700 px-6 m-auto text-center"
    style="transform: translateY(50%);">
    <img
      src="./img/no_signal.svg"
      class="m-auto"
      style="width: 400px; height: auto"
      alt="Oupe ! Erreur réseau !" />
    <div class="py-5">
      <h1 class="font-bold">Réseau, réseau, où es-tu ?</h1>
      <p class="text-gray-600">
        Il semblerait que vous ayez perdu votre connexion internet.
      </p>
      <p class="text-gray-600">
        Vérifiez votre connexion et rafraichissez la page.
      </p>
      <a class="btn btn-accent" 
        href="javascript:void(0)"
        on:click={() => goToHome(authInstance, routerInstance)}>
        Rafraîchir</a>
      <p class="text-sm text-gray-600 mt-5">Aucune connexion internet</p>
    </div>
  </div>
</div>
