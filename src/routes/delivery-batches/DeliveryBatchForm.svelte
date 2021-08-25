<script>
	import Icon from "svelte-awesome";
	import AddOrderModal from "./AddOrderModal.svelte";
	import { faCircleNotch, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
	import { form, bindClass } from "../../../vendors/svelte-forms/src/index";
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import { validators, initialValues } from "./deliveryBatchForm";
	import SortList from "../../components/SortList.svelte";
	import DeliveryWithOrdersCard from "./DeliveryWithOrdersCard.svelte";
	import { getContext } from "svelte";
	import DeliveryBatchStatus from "../../enums/DeliveryBatchStatus";
	import TimePicker from "../../components/controls/TimePicker.svelte";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";

	export let submit,
		deliveryBatch = { ...initialValues };

	let isLoading = false;

	const { open } = getContext("modal");

	const deliveryBatchForm = form(() => validators(deliveryBatch), { initCheck: false });

	const handleSubmit = async () => {
		await deliveryBatchForm.validate();
		if ($deliveryBatchForm.valid) {
			isLoading = true;
			await submit();
			isLoading = false;
		}
	};
</script>

<!-- svelte-ignore component-name-lowercase -->
<form class="w-full" on:submit|preventDefault={handleSubmit}>
	<div class="mb-6 lg:mb-0">
		<div class="form-control">
			<div class="w-full">
				<label>Nom de la tournée *</label>
				<input
					bind:value={deliveryBatch.name}
					class:disabled={isLoading}
					use:bindClass={{ form: deliveryBatchForm, name: "name" }}
					disabled={isLoading || deliveryBatch.status != DeliveryBatchStatus.Waiting.Value}
					id="grid-product"
					type="text"
					placeholder="Livraison centre Annecy"
				/>
			</div>
			<ErrorContainer field={$deliveryBatchForm.fields.name} />
		</div>
		<div class="form-control">
			<div class="w-full flex space-x-4">
				<div>
					<label>Date de départ</label>
					<input
						type="text"
						class="disabled"
						value={format(new Date(deliveryBatch.scheduledOn), "PPPP", { locale: fr })}
						disabled
					/>
				</div>
				<div>
					<label>Heure de départ</label>
					<TimePicker
						bind:time={deliveryBatch.from}
						disabled
					/>
				</div>
			</div>
		</div>
		<div class="form-control">
			<div class="w-full">
				<label>Clients à livrer</label>
				{#if deliveryBatch.deliveries.length > 1}
					<p class="text-gray-600 mb-2">
						Vous pouvez faire glisser les blocs pour changer l'ordre de livraison.
					</p>
				{/if}
				{#if deliveryBatch.status == DeliveryBatchStatus.Waiting.Value}
					<button
						type="button"
						on:click|preventDefault={() => open(AddOrderModal, { deliveryBatch })}
						class="btn btn-outline btn-lg mb-2">Ajouter une commande</button
					>
				{/if}
				<SortList
					disableGrab={deliveryBatch.deliveries.length <= 1 ||
						deliveryBatch.status != DeliveryBatchStatus.Waiting.Value}
					bind:data={deliveryBatch.deliveries}
					component={DeliveryWithOrdersCard}
				/>
				<!-- listing purchase orders -->
			</div>
		</div>
	</div>
	<p class="text-sm mt-5">* champs requis</p>
	<div class="form-control mt-5">
		{#if deliveryBatch.status == DeliveryBatchStatus.Waiting.Value}
			<button
				type="submit"
				class:disabled={isLoading || !$deliveryBatchForm.valid}
				class="btn btn-primary btn-xl justify-center w-full md:w-auto"
			>
				<Icon data={isLoading ? faCircleNotch : faPaperPlane} class="mr-2 inline" spin={isLoading} />
				Valider
			</button>
		{/if}
	</div>
</form>
