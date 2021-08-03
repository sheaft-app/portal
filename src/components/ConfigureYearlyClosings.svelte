<script>
	import { GET_BUSINESS_CLOSINGS } from "./queries";
	import Icon from "svelte-awesome";
	import { faEdit } from "@fortawesome/free-solid-svg-icons";
	import ManageYearlyClosingsModal from "./ManageYearlyClosingsModal.svelte";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import SheaftErrors from "./../services/SheaftErrors";
	import { onMount, getContext } from "svelte";

	export let container = "";

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query } = getContext("api");

	let closings = [];

	onMount(async () => {
		closings = await query({
			query: GET_BUSINESS_CLOSINGS,
			errorsHandler,
			errorNotification: "Impossible de récupérer les informations de fermetures",
		});
	});

	const openManageClosingsModal = () =>
		open(ManageYearlyClosingsModal, {
			onClose: (res) => (closings = res),
		});
</script>

<div class={container}>
	<button type="button" on:click={openManageClosingsModal} class="btn-link flex items-center">
		<Icon data={faEdit} class="mr-2" />
		Gérer fermetures annuelles
	</button>
	{#if closings && closings.length > 0}
		<p class="font-semibold mt-2">Fermetures configurées :</p>
		<ul style="list-style: circle;padding: revert;">
			{#each closings as closing}
				<li>
					du {format(new Date(closing.from), "PPPP", { locale: fr })} au {format(
						new Date(closing.to),
						"PPPP",
						{
							locale: fr,
						}
					)}
				</li>
			{/each}
		</ul>
	{/if}
</div>
