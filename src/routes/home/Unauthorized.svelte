<script>
</script>

<svelte:head>
  <title>Accès interdit</title>
</svelte:head>

<div
  class="text-gray-700 px-6 m-auto text-center"
  style="transform: translateY(50%); margin-top: -4.5em;">
  <img
    src="./img/403.svg"
    class="m-auto"
    style="width: 400px; height: auto"
    alt="Vous n'êtes pas autorisé à être ici !" />
  <div class="py-5">
    <h1 class="font-bold">Hey, vous n'avez rien à faire ici !</h1>
    <p class="text-gray-600">
      Votre laissez passer ne vous permets pas d'accéder à cette ressource.
    </p>
    <a class="btn-link" href="/">Retourner à l'accueil</a>
    <p class="text-sm text-gray-500 mt-5">Erreur 403 - Accès interdit</p>
  </div>
</div>
