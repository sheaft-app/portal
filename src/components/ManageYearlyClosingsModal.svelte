<script>
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./modal/ActionConfirm.svelte";
	import GetAuthInstance from "./../services/SheaftAuth";
	import { GET_BUSINESS_CLOSINGS } from "./queries.js";
	import { UPDATE_BUSINESS_CLOSINGS } from "./mutations.js";
	import SheaftErrors from "./../services/SheaftErrors";
	import ClosingDates from "./ClosingDates.svelte";
	import { normalizeClosingDates, denormalizeClosingDates } from "../helpers/app";
	import { getContext, onMount } from "svelte";
	import Loader from "./Loader.svelte";

	const errorsHandler = new SheaftErrors();
	const authInstance = GetAuthInstance();
	const { query, mutate } = getContext("api");

	export let onClose, close;

	let isLoading = false;
	let isInitializing = true;
	let closings = [];

	$: valid = true;

	onMount(async () => {
		await query({
			query: GET_BUSINESS_CLOSINGS,
			errorsHandler,
			success: (res) => (closings = denormalizeClosingDates(res)),
			errorNotification: "Impossible de récupérer les informations de fermetures",
		});
		isInitializing = false;
	});

	async function submit() {
		isLoading = true;
		await mutate({
			mutation: UPDATE_BUSINESS_CLOSINGS,
			variables: { id: authInstance.user.profile.id, closings: normalizeClosingDates(closings) },
			errorsHandler,
			success: async (res) => {
				closings = denormalizeClosingDates(result.data);
				await closeModal(res);
			},
			errorNotification: "Une erreur est survenue pendant la configuration de vos fermetures annuelles",
			successNotification: "Vos fermetures annuelles ont bien été mises à jour !",
			clearCache: [GET_BUSINESS_CLOSINGS],
		});
		isLoading = false;
	}

	async function closeModal(res) {
		if (onClose) {
			onClose(res);
		}

		close();
	}

</script>

<ActionConfirm
	{errorsHandler}
	title="Gérer les fermetures annuelles"
	{submit}
	{isLoading}
	{close}
	submitText="Sauvegarder"
	icon={faCheck}
	{valid}
	closeText="Fermer"
>
	<p class="pt-2 pb-1 leading-5">Renseignez ici les fermetures annuelles de votre exploitation.</p>
	<p class="pb-2 leading-5">Les clients ne pourront pas commander des produits à récupérer pendant ces périodes.</p>
	{#if isInitializing}
		<Loader />
	{:else}
		<ClosingDates bind:closings />
	{/if}
</ActionConfirm>
