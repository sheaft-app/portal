<script>
	import ActionConfirm from "../../components/modal/ActionConfirm.svelte";
	import GetGraphQLInstance from "../../services/SheaftGraphQL";
	import { UPDATE_CATALOG_PRICES } from "./mutations";
	import SheaftErrors from "../../services/SheaftErrors";
	import { GET_CATALOGS } from "./queries";
import { formatMoney } from "../../helpers/app";

	const errorsHandler = new SheaftErrors();
	const graphQLInstance = GetGraphQLInstance();

	export let catalog, close, onClose;

	let isLoading = false;
	let percent = 0;

	$: getNewProductPrice = (price, newPercent) => {
		return newPercent == 0 ? price : price * (1 + newPercent / 100);
	}

	const handleSubmit = async () => {
		isLoading = true;
		var res = await graphQLInstance.mutate(
			UPDATE_CATALOG_PRICES, { id: catalog.id, percent: percent },
			errorsHandler.Uuid,
			GET_CATALOGS
    );
    
		isLoading = false;

		if (!res.success) {
			//TODO
			return;
		}

		return await handleClose(res);
	};

	const handleClose = async (res) => {
		close();
		if (onClose) await onClose(res);
	};
</script>

<ActionConfirm
	title="Mettre à jour les prix du catalogue"
	level="success"
	{isLoading}
	submit={handleSubmit}
	{errorsHandler}
	close={() => handleClose({ success: false, data: null })}>
	<p class="leading-5">
		Vous vous apprêtez à mettre à jour tous les prix du catalogue {catalog.name}
	</p>
	<div class="form-control w-full mt-5" style="margin-bottom: 0;">
		<label
			for="percent">
			Modifier les prix du catalogue (en %)
		</label>
		<input
			bind:value={percent}
			id="percent"
			type="number"
			min="-100" max="100"/>
	</div>
	<small>Si vous souhaitez appliquer une réduction, n'oubliez pas de mettre un '-'</small>
	<div class="mt-5">
		<p class="uppercase font-semibold text-xs pb-3">Prévisualisation</p>
		<table class="shadow">
			<thead>
				<tr class="bg-white">
				<th class="px-3 md:px-6 py-3 border-b border-gray-300 text-left lg:table-cell text-xs leading-4 font-medium text-gray-600 uppercase">Produit</th>
				<th class="px-3 md:px-6 py-3 border-b border-gray-300 text-left lg:table-cell text-xs leading-4 font-medium text-gray-600 uppercase">Ancien prix HT</th>
				<th class="px-3 md:px-6 py-3 border-b border-gray-300 text-left lg:table-cell text-xs leading-4 font-medium text-gray-600 uppercase">Nouveau prix HT</th>
			</tr>
			</thead>
			<tbody>
				{#each catalog.products as product}
					<tr class="bg-gray-100">
						<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">{product.name}</td>
						<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">{formatMoney(product.wholeSalePricePerUnit)}</td>
						<td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">{formatMoney(getNewProductPrice(product.wholeSalePricePerUnit, percent))}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</ActionConfirm>
