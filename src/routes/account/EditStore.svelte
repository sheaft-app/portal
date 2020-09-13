<script>
	import Loader from "./../../components/Loader.svelte";
	import { onMount } from "svelte";
	import Icon from "svelte-awesome";
	import { faCircleNotch, faCheck } from "@fortawesome/free-solid-svg-icons";
	import GetAuthInstance from "./../../services/SheaftAuth.js";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import { UPDATE_STORE } from "./mutations.js";
	import { GET_STORE_DETAILS } from "./queries.js";

	export let errorsHandler, userId;
	const graphQLInstance = GetGraphQLInstance();
	const authInstance = GetAuthInstance();

	let isLoading = false;
	let store = null;

	$: isValid = store && store.firstName && store.lastName && store.email;

	const handleGet = async () => {
		isLoading = true;
		var res = await graphQLInstance.query(
			GET_STORE_DETAILS,
			{
				id: userId,
			},
			errorsHandler.Uuid
		);
		isLoading = false;

		if (!res.success) {
			//TODO
			return;
		}

		store = res.data;
	};

	const handleUpdate = async () => {
		isLoading = true;

		var res = await graphQLInstance.mutate(
			UPDATE_STORE,
			store,
			errorsHandler.Uuid
		);
		isLoading = false;

		if (!res.success) {
			//TODO
			return;
		}

		await authInstance.loginSilent();
	};

	onMount(async () => {
		await handleGet();
	});
</script>

{#if isLoading || !store}
	<Loader />
{:else}
	<form class="w-full" on:submit|preventDefault={() => handleUpdate()}>
		<div class="form-control">
			<div class="w-full md:w-2/4 pr-0 md:pr-2 mb-3 md:mb-0">
				<label for="grid-first-name">Prénom *</label>
				<input
					bind:value={store.firstName}
					required
					id="grid-first-name"
					type="text"
					placeholder="Jean" />
			</div>
			<div class="w-full md:w-2/4">
				<label for="grid-last-name">Nom *</label>
				<input
					bind:value={store.lastName}
					required
					type="text"
					placeholder="Dupont" />
			</div>
		</div>
		<div class="form-control">
			<div class="w-full md:w-3/3">
				<label for="grid-email">Email *</label>
				<input
					bind:value={store.email}
					required
					id="grid-email"
					type="email"
					placeholder="jean.dupont@test.xyz" />
			</div>
		</div>
		<div class="form-control">
			<div class="w-full md:w-1/2">
				<label for="grid-phone">Téléphone</label>
				<input bind:value={store.phone} id="grid-phone" type="tel" />
			</div>
		</div>
		<p class="text-sm mt-5">* champs requis</p>
		<div class="form-control mt-5">
			<button
				type="submit"
				class:disabled={isLoading || !isValid}
				disabled={isLoading || !isValid}
				class="btn btn-xl btn-primary w-full md:w-auto justify-center">
				<Icon
					data={isLoading ? faCircleNotch : faCheck}
					class="mr-1 inline"
					spin={isLoading} />
				Valider
			</button>
		</div>
	</form>
{/if}
