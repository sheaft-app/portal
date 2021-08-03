<script>
	import GetAuthInstance from "./../../services/SheaftAuth.js";
	import Loader from "../../components/Loader.svelte";
	GetAuthInstance().loginCallback();
</script>

<svelte:head>
	<title>Connexion</title>
</svelte:head>

<div class="w-full h-full flex justify-center">
	<div class="text-center text-xl m-auto">
		<Loader />
	</div>
</div>
