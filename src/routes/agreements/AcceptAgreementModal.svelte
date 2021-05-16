<script>
	import {faCheck} from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import GetAuthInstance from "../../services/SheaftAuth";
	import {ACCEPT_AGREEMENTS} from "./mutations.js";
	import SheaftErrors from "./../../services/SheaftErrors";
	import {GET_AGREEMENTS} from "./queries.js";
	import Roles from "../../enums/Roles";
	import SelectTime from "../search-stores/SelectTime.svelte";
	import SelectCatalog from "../search-stores/SelectCatalog.svelte";

	const errorsHandler = new SheaftErrors();

	export let onClose, close, agreements;
	const graphQLInstance = GetGraphQLInstance();
	const authInstance = GetAuthInstance();

	let requireDeliverySelection = agreements.some(a => !a.delivery);
	let requireCatalogSelection = agreements.some(a => !a.catalog);
	let isProducer = authInstance.isInRole(Roles.Producer.Value);
	let isLoading = false;
	let deliveries = [];
	let selectedDelivery = null;
	let selectedCatalog = null;

	$: isValid = isProducer ? (!requireDeliverySelection || selectedDelivery != null) && (!requireCatalogSelection || selectedCatalog != null) : true;

	const handleSubmit = async () => {
		isLoading = true;
		var res = await graphQLInstance.mutate(ACCEPT_AGREEMENTS, {
				ids: agreements.map(a => a.id),
				deliveryId: selectedDelivery?.id,
				catalogId: selectedCatalog?.id
			},
			errorsHandler.Uuid,
			GET_AGREEMENTS);

		isLoading = false;

		if (!res.success) {
			// todo
			return;
		}

		await handleClose(res);
	}

	const handleClose = async (res) => {
		close();
		if (onClose) await onClose(res);
	}
</script>

{#if agreements.length > 1}
	<ActionConfirm
		{errorsHandler}
		title="Accepter les accords"
		icon={faCheck}
		{isLoading}
		submit={handleSubmit}
		submitText="Confirmer"
		closeText="Annuler"
		valid={isValid}
		close={() => handleClose({success:false, data:null})}>
		<div class="leading-5 text-gray-600 mt-2 mb-3">
			Vous vous apprêtez à accepter les accords avec les { isProducer ? "magasins" : "producteurs"} suivants:
			<ul>
				{#each agreements.filter(a => a.delivery) as agreement}
					<li>{isProducer ? agreement.store.name + ` (${agreement.delivery.name})` : agreement.producer.name}</li>
				{/each}
			</ul>
		</div>

		{#if isProducer && requireDeliverySelection}
			<div class="leading-5 text-gray-600 mt-3 mb-5">
				Ces accords ne possèdent pas de livraison associée
				<ul>
					{#each agreements.filter(a => !a.delivery) as agreement}
						<li>{agreement.store.name}</li>
					{/each}
				</ul>
			</div>

			<SelectTime bind:selectedDelivery/>
		{/if}

		{#if isProducer && requireCatalogSelection}
			<div class="leading-5 text-gray-600 mt-3 mb-5">
				Ces accords ne possèdent pas de catalogue associé
				<ul>
					{#each agreements.filter(a => !a.catalog) as agreement}
						<li>{agreement.store.name}</li>
					{/each}
				</ul>
			</div>

			<SelectCatalog bind:selectedCatalog/>
		{/if}
	</ActionConfirm>
{:else}
	<ActionConfirm
		{errorsHandler}
		title="Accepter l'accord"
		icon={faCheck}
		{isLoading}
		submit={handleSubmit}
		submitText="Confirmer"
		closeText="Annuler"
		valid={isValid}
		close={() => handleClose({success:false, data:null})}>
		<div class="leading-5 text-gray-600 mt-2 mb-5">
			Vous vous apprêtez à accepter l'accord avec {isProducer ? agreements[0].store.name : agreements[0].producer.name}
		</div>

		{#if isProducer && requireDeliverySelection}
			<SelectTime bind:selectedDelivery/>
		{/if}

		{#if isProducer && requireCatalogSelection}
			<SelectCatalog bind:selectedCatalog/>
		{/if}
	</ActionConfirm>
{/if}
