<script>
	import { getContext } from "svelte";
	import { GET_PICKINGS } from "../queries";
	import { COMPLETE_PICKING } from "../mutations";
	import ActionConfirm from "../../../components/modal/ActionConfirm.svelte";
	import GetRouterInstance from "../../../services/SheaftRouter";
	import SheaftErrors from "../../../services/SheaftErrors";
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import PickingRoutes from "../routes";
	import { authUserAccount } from "../../../stores/auth.js";

	export let close, variables, save = () => {}, products;

	const errorsHandler = new SheaftErrors();
	const { mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	const missingProducts = products.reduce((acc, curr) => {
		curr.clients.map(c => {
			if (c.prepared < c.expected) {
				acc = [...acc, {
					...c,
					productName: curr.name
				}];
			}
		});
		return acc;
	}, []);

	let isSubmitting = false;
	let preparedBy = $authUserAccount.profile.given_name;

	const handleSubmit = async () => {
		isSubmitting = true;
		await save();
		await mutate({
			mutation: COMPLETE_PICKING,
			variables,
			errorsHandler,
			success: () => routerInstance.goTo(PickingRoutes.List),
			errorNotification: "Impossible de terminer la préparation",
			clearCache: [variables.id, GET_PICKINGS],
		});
		isSubmitting = false;
	};
</script>

<ActionConfirm
	{errorsHandler}
	title="Valider la préparation"
	icon={faCheck}
	isLoading={isSubmitting}
	submit={handleSubmit}
	submitText="Confirmer"
	closeText="Annuler"
	{close}
>
	{#if missingProducts.length > 0}
		<div class="mb-2 text-left">
			<ul class="list-disc px-5">
			{#each missingProducts as missingProduct}
				<li>{missingProduct.name} attendait {missingProduct.expected} {missingProduct.productName} mais {missingProduct.prepared} ont été préparés.</li>
			{/each}
			</ul>
			<p class="mt-2 text-red-500">Une fois la préparation validée, les quantités ne seront plus modifiables.</p>
			<p class="mt-2 text-red-500">Si cette préparation sera terminée plus tard, cliquez sur "Annuler" puis sur "Sauvegarder et continuer plus tard".</p>
		</div>
	{/if}
	<div class="form-control">
		<label>Préparé par</label>
		<input bind:value={preparedBy} />
	</div>
</ActionConfirm>
