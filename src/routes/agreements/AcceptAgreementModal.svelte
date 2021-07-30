<script>
	import { getContext } from "svelte";
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
	import GetAuthInstance from "../../services/SheaftAuth";
	import { ACCEPT_AGREEMENTS } from "./mutations.js";
	import Icon from "svelte-awesome";
	import SheaftErrors from "./../../services/SheaftErrors";
	import { GET_AGREEMENTS } from "./queries.js";
	import Roles from "../../enums/Roles";
	import SelectTime from "../search-stores/SelectTime.svelte";
	import SelectCatalog from "../search-stores/SelectCatalog.svelte";
	import DeliveryRoutes from "../deliveries/routes";
	import GetRouterInstance from "../../services/SheaftRouter";

	export let onClose, close, agreements;

	const errorsHandler = new SheaftErrors();
	const authInstance = GetAuthInstance();
	const routerInstance = GetRouterInstance();
	const { mutate, isLoading } = getContext("api");

	let requireDeliverySelection = agreements.some((a) => !a.delivery);
	let requireCatalogSelection = agreements.some((a) => !a.catalog);
	let isProducer = authInstance.isInRole(Roles.Producer.Value);
	let selectedDelivery = null;
	let selectedCatalog = null;
	let showSuccess = false;

	$: isValid = isProducer
		? (!requireDeliverySelection || selectedDelivery != null) && (!requireCatalogSelection || selectedCatalog != null)
		: true;

	const handleSubmit = async () => {
		await mutate({
			mutation: ACCEPT_AGREEMENTS,
			variables: {
				ids: agreements.map((a) => a.id),
				deliveryId: selectedDelivery?.id,
				catalogId: selectedCatalog?.id,
			},
			errorsHandler,
			success: async (res) => {
				await onClose({ success: true, data: res });
				if (authInstance.isInRole(Roles.Producer.Value)) showSuccess = true;
				else close();
			},
			successNotification: "L'accord a bien été accepté",
			errorNotification: "Impossible de traiter l'accord",
			clearCache: [GET_AGREEMENTS],
		});
	};
</script>

{#if authInstance.isInRole(Roles.Producer.Value) && showSuccess}
	<div class="m-auto text-center">
		<div class="rounded-full bg-white shadow w-12 h-12 m-auto items-center flex justify-center text-green-500">
			<Icon data={faCheck} scale="1.4" />
		</div>
		<p class="font-semibold mb-2 mt-2">Partenariat accepté !</p>
		<p>Pour modifier la position du magasin dans la tournée de livraison, rendez-vous sur la page du créneau.</p>
		<div class="flex justify-center mt-3">
			<button type="button" class="px-4 py-2 mr-2" on:click={close}>Fermer</button>
			<button
				type="button"
				class="mr-2 btn btn-primary btn-lg"
				on:click={() => routerInstance.goTo(DeliveryRoutes.Details, { id: selectedDelivery?.id })}
				>Modifier la position du magasin</button
			>
		</div>
	</div>
{:else if agreements.length > 1}
	<ActionConfirm
		{errorsHandler}
		title="Accepter les accords"
		icon={faCheck}
		isLoading={$isLoading}
		submit={handleSubmit}
		submitText="Confirmer"
		closeText="Annuler"
		valid={isValid}
		{close}
	>
		<div class="leading-5 text-gray-600 mt-2 mb-3">
			Vous vous apprêtez à accepter les accords avec les {isProducer ? "magasins" : "producteurs"} suivants:
			<ul>
				{#each agreements.filter((a) => a.delivery) as agreement}
					<li>{isProducer ? agreement.store.name + ` (${agreement.delivery.name})` : agreement.producer.name}</li>
				{/each}
			</ul>
		</div>

		{#if isProducer && requireDeliverySelection}
			<div class="leading-5 text-gray-600 mt-3 mb-5">
				Ces accords ne possèdent pas de livraison associée
				<ul>
					{#each agreements.filter((a) => !a.delivery) as agreement}
						<li>{agreement.store.name}</li>
					{/each}
				</ul>
			</div>

			<SelectTime bind:selectedDelivery {errorsHandler} />
		{/if}

		{#if isProducer && requireCatalogSelection}
			<div class="leading-5 text-gray-600 mt-3 mb-5">
				Ces accords ne possèdent pas de catalogue associé
				<ul>
					{#each agreements.filter((a) => !a.catalog) as agreement}
						<li>{agreement.store.name}</li>
					{/each}
				</ul>
			</div>

			<SelectCatalog bind:selectedCatalog {errorsHandler} />
		{/if}
	</ActionConfirm>
{:else}
	<ActionConfirm
		{errorsHandler}
		title="Accepter l'accord"
		icon={faCheck}
		isLoading={$isLoading}
		submit={handleSubmit}
		submitText="Confirmer"
		closeText="Annuler"
		valid={isValid}
		{close}
	>
		<div class="leading-5 text-gray-600 mt-2 mb-5">
			Vous vous apprêtez à accepter l'accord avec {isProducer ? agreements[0].store.name : agreements[0].producer.name}
		</div>

		{#if isProducer && requireDeliverySelection}
			<SelectTime bind:selectedDelivery {errorsHandler} />
		{/if}

		{#if isProducer && requireCatalogSelection}
			<SelectCatalog bind:selectedCatalog {errorsHandler} />
		{/if}
	</ActionConfirm>
{/if}
