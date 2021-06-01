<script>
	import GetAuthInstance from "./../../services/SheaftAuth";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import { goToHome } from "./../../helpers/navigation";

	const authInstance = GetAuthInstance();
	const routerInstance = GetRouterInstance();

</script>

<svelte:head>
	<title>Page introuvable</title>
</svelte:head>

<div class="text-gray-700 px-6 m-auto text-center" style="transform: translateY(50%); margin-top: -4.5em;">
	<img
		src="./img/404.svg"
		class="m-auto"
		style="width: 400px; height: auto"
		alt="Erreur 404 - Mais où suis-je encore passé ?"
	/>
	<div class="py-5">
		<h1 class="font-bold">Qu'est-ce que vous faites ici ?</h1>
		<p class="text-gray-600">Il n'y a rien à voir ici à part l'herbe qui pousse.</p>
		<p class="text-gray-600">Vous pouvez rester si vous voulez voir l'herbe pousser. Sinon oust !</p>
		<a class="btn-link" href="javascript:void(0)" on:click={() => goToHome(authInstance, routerInstance)}>
			Retourner à l'accueil</a
		>
		<p class="text-sm text-gray-600 mt-5">Erreur 404 - Ressource introuvable</p>
	</div>
</div>
