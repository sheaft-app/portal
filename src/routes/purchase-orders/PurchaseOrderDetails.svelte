<script>
	import { onMount, getContext } from "svelte";
	import Icon from "svelte-awesome";
	import AcceptPurchaseOrders from "./AcceptPurchaseOrders.svelte";
	import RefusePurchaseOrders from "./RefusePurchaseOrders.svelte";
	import CancelPurchaseOrders from "./CancelPurchaseOrders.svelte";
	import DeliverPurchaseOrders from "./DeliverPurchaseOrders.svelte";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import { timeSpanToFrenchHour, formatMoney } from "./../../helpers/app";
	import { GET_ORDERS, GET_ORDER_DETAILS } from "./queries.js";
	import {
		canCreatePickingOrder,
		canCancelOrder,
		canAcceptOrder,
		canRefuseOrder,
		canProcessOrder,
		canCompleteOrder,
		canDeliverOrder,
		canShipOrder,
	} from "./validators";
	import {
		faTimes,
		faBackspace,
		faCheck,
		faTruck,
		faTruckLoading,
		faClipboardCheck,
		faPlay,
		faPeopleCarry,
	} from "@fortawesome/free-solid-svg-icons";
	import PurchaseOrderRoutes from "./routes";
	import DeliveryBatchRoutes from "./../delivery-batches/routes";
	import RetrievalRoutes from "./../retrievals/routes";
	import PurchaseOrderStatusKind from "../../enums/PurchaseOrderStatusKind";
	import DeliveryKind from "./../../enums/DeliveryKind";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import DeliveryStatus from "../../enums/DeliveryStatus";
	import ProfileKind from "../../enums/ProfileKind";
	import CreateDeliveryBatchForPurchaseOrders from "./CreateDeliveryBatchForPurchaseOrders.svelte";
	import ChooseAvailablePickingModal from "./../pickings/ChooseAvailablePickingModal.svelte";
	import { querystring } from "svelte-spa-router";

	export let params = {};

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query } = getContext("api");
	const routerInstance = GetRouterInstance();

	let order = null;
	let isLoading = true;

	const getPurchaseOrder = async () => {
		isLoading = true;
		order = await query({
			query: GET_ORDER_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(PurchaseOrderRoutes.List),
			errorNotification: "La commande à laquelle vous essayez d'accéder n'existe plus.",
			skipCache: routerInstance.shouldSkipCache(),
		});
		isLoading = false;
	};

	onMount(async () => {
		await getPurchaseOrder();
	});

	const cancelOrder = () => handleOrdersModal(CancelPurchaseOrders, order);

	const refuseOrder = () => handleOrdersModal(RefusePurchaseOrders, order);

	const acceptOrder = () => handleOrdersModal(AcceptPurchaseOrders, order);

	const processOrder = () => {
		open(ChooseAvailablePickingModal, {
			selectedItems: [order],
		});
	};

	const shipOrder = () => handleOrdersModal(CreateDeliveryBatchForPurchaseOrders, order);

	const deliverOrder = () => handleOrdersModal(DeliverPurchaseOrders, order);

	const handleOrdersModal = (modal, item) =>
		open(modal, {
			purchaseOrders: [item],
			onClose: async (res) => {
				if (res.success) routerInstance.refresh();
			},
		});

	$: getPurchaseOrder($querystring);
</script>

<TransitionWrapper>
	<PageHeader name="Détails de la commande" previousPage={PurchaseOrderRoutes.List} />
	<PageBody {errorsHandler} {isLoading} loadingMessage="Chargement des informations de votre commande.">
		{#if order.status === PurchaseOrderStatusKind.Waiting.Value}
			<div
				class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-blue-100 shadow
        md:rounded mb-3"
			>
				<p class="font-semibold leading-none">Commande en attente de traitement.</p>
			</div>
		{/if}
		{#if order.status === PurchaseOrderStatusKind.Cancelled.Value}
			<div
				class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-gray-100 shadow
        md:rounded mb-3"
			>
				<p class="font-semibold leading-none">Commande annulée.</p>
				{#if order.reason}
					<div class="mt-2">
						<p>Raison : {order.reason}</p>
					</div>
				{/if}
			</div>
		{/if}
		{#if order.status === PurchaseOrderStatusKind.Expired.Value}
			<div
				class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-gray-100 shadow
        md:rounded mb-3"
			>
				<p class="font-semibold leading-none">Commande expirée.</p>
				{#if order.reason}
					<div class="mt-2">
						<p>Raison : {order.reason}</p>
					</div>
				{/if}
			</div>
		{/if}
		{#if order.status === PurchaseOrderStatusKind.Withdrawned.Value}
			<div
				class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-gray-100 shadow
        md:rounded mb-3"
			>
				<p class="font-semibold leading-none">Commande annulée par le client.</p>
				{#if order.reason}
					<div class="mt-2">
						<p>Raison : {order.reason}</p>
					</div>
				{/if}
			</div>
		{/if}
		{#if order.status === PurchaseOrderStatusKind.Refused.Value}
			<div
				class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-red-100 shadow
        md:rounded mb-3"
			>
				<p class="font-semibold leading-none">Commande refusée.</p>
				{#if order.reason}
					<div class="mt-2">
						<p>Raison : {order.reason}</p>
					</div>
				{/if}
			</div>
		{/if}
		{#if order.status === PurchaseOrderStatusKind.Completed.Value && order.delivery}
			<div
				class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-white shadow
        md:rounded mb-3"
			>
				<div class="flex">
					{#if order.delivery.kind === DeliveryKind.ProducerToStore.Value}
						<Icon data={faTruck} scale="1.5" class="mr-5 text-blue-400" />
					{:else}
						<Icon data={faPeopleCarry} scale="1.5" class="mr-5 text-blue-400" />
					{/if}
					<div>
						{#if order.delivery.kind === DeliveryKind.ProducerToStore.Value}
							<p class="uppercase font-bold leading-none">
								Livraison (<a
									href="javascript:void(0)"
									on:click={() =>
										routerInstance.goTo(DeliveryBatchRoutes.Edit, { id: order.delivery.deliveryBatch.id })}
									>cliquez pour voir le détails</a
								>)
							</p>
							<div class="mt-2">
								{#if order.delivery.status === DeliveryStatus.Waiting.Value}
									<p>Cette commande est en attente de validation de la tournée de livraison.</p>
								{:else if order.delivery.status === DeliveryStatus.Ready.Value}
									<p>
										Cette commande est prête à être livrée. (<a href={order.delivery.deliveryFormUrl}
											>bon de livraison</a
										>)
									</p>
								{:else if order.delivery.status === DeliveryStatus.InProgress.Value}
									<p>Cette commande est en cours de livraison.</p>
								{:else if order.delivery.status === DeliveryStatus.Delivered.Value}
									<p>Cette commande est livrée.</p>
								{:else if order.delivery.status === DeliveryStatus.Rejected.Value}
									<p>Cette commande a été refusée à la livraison.</p>
								{:else if order.delivery.status === DeliveryStatus.Skipped.Value}
									<p>Cette commande a été passée lors de la livraison.</p>
								{/if}
							</div>
						{:else}
							Distribution {order.expectedDelivery.name}(<a
								href="javascript:void(0)"
								on:click={() => routerInstance.goTo(RetrievalRoutes.Details, { id: order.id })}
								>cliquez pour voir le détails</a
							>){/if}
					</div>
				</div>
			</div>
		{/if}
		{#if order.status === PurchaseOrderStatusKind.Delivered.Value}
			<div
				class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-green-100 shadow
        md:rounded mb-3"
			>
				<p class="font-semibold leading-none">
					Commande {order.sender.kind === ProfileKind.Store.Value ? "livrée" : "récupérée"}
				</p>
			</div>
		{/if}
		{#if order.status !== PurchaseOrderStatusKind.Refused.Value && order.status !== PurchaseOrderStatusKind.Cancelled.Value && order.expectedDelivery.expectedDeliveryDate && order.status !== PurchaseOrderStatusKind.Delivered.Value}
			<div
				class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-white shadow
        md:rounded md:mb-3"
			>
				<div class="flex">
					{#if order.status === PurchaseOrderStatusKind.Completed.Value}
						<Icon data={faCheck} scale="1.2" class="mr-5" />
					{:else if order.expectedDelivery.kind === DeliveryKind.ProducerToStore.Value}
						<Icon data={faTruck} scale="1.2" class="mr-5" />
					{:else}
						<Icon data={faPeopleCarry} scale="1.2" class="mr-5" />
					{/if}
					<div>
						<div>
							<p class="leading-none">
								{#if order.expectedDelivery.kind === DeliveryKind.ProducerToStore.Value}
									À livrer le :
								{:else}
									À distribuer le :
								{/if}
								<b class="font-semibold">
									{format(new Date(order.expectedDelivery.expectedDeliveryDate), "PPPP", {
										locale: fr,
									})}
								</b>
								entre
								<b class="font-semibold">{timeSpanToFrenchHour(order.expectedDelivery.from)}</b>
								et
								<b class="font-semibold">{timeSpanToFrenchHour(order.expectedDelivery.to)}</b>
							</p>
							{#if order.expectedDelivery.address}
								<p>
									{#if order.expectedDelivery.kind === DeliveryKind.ProducerToStore.Value}
										Adresse :
										<b class="font-semibold">
											{order.expectedDelivery.address.line1}, {order.expectedDelivery.address.zipcode}
											{order.expectedDelivery.address.city}
										</b>
									{:else}
										Lieu :
										<b class="font-semibold">
											{order.expectedDelivery.name} au
											{order.expectedDelivery.address.line1}, {order.expectedDelivery.address.zipcode}
											{order.expectedDelivery.address.city}
										</b>
									{/if}
								</p>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/if}
		{#if order.status !== PurchaseOrderStatusKind.Refused.Value && order.status !== PurchaseOrderStatusKind.Cancelled.Value}
			<div
				class="bg-white md:mt-3 px-0
        md:px-5 py-5 overflow-x-auto -mx-4 md:mx-0 border border-gray-400"
				style="border-bottom: 0;"
			>
				<div class="flex flex-wrap">
					<button
						on:click={acceptOrder}
						class:hidden={!canAcceptOrder(order)}
						class="py-1 px-3 rounded items-center flex transition duration-300
            ease-in-out text-green-500 w-full lg:w-auto"
					>
						<Icon data={faCheck} class="mr-2 hidden lg:inline w-4 h-4" />
						<span>Accepter</span>
					</button>
					<button
						on:click={refuseOrder}
						class:hidden={!canRefuseOrder(order)}
						class="py-1 px-3 rounded items-center flex transition duration-300
            ease-in-out text-red-500 w-full lg:w-auto"
					>
						<Icon data={faTimes} class="mr-2 hidden lg:inline w-4 h-4" />
						<span>Refuser</span>
					</button>
					<button
						class:hidden={!canCancelOrder(order)}
						on:click={cancelOrder}
						class="py-1 px-3 rounded items-center flex transition duration-300
            ease-in-out text-orange-500 w-full lg:w-auto"
					>
						<Icon data={faTimes} class="mr-2 hidden lg:inline w-4 h-4" />
						<span>Annuler</span>
					</button>
					<button
						class:hidden={!canProcessOrder(order)}
						on:click={processOrder}
						class="py-1 px-3 rounded items-center flex transition duration-300
            ease-in-out text-green-500 w-full lg:w-auto"
					>
						<Icon data={faPlay} class="mr-2 hidden lg:inline w-4 h-4" />
						<span>Préparer</span>
					</button>
					<button
						class:hidden={!canShipOrder(order)}
						on:click={shipOrder}
						class="py-1 px-3 rounded items-center flex transition duration-300
            ease-in-out text-green-500 w-full lg:w-auto"
					>
						<Icon data={faTruckLoading} class="mr-2 hidden lg:inline w-4 h-4" />
						<span>Programmer la livraison</span>
					</button>
					<button
						class:hidden={!canDeliverOrder(order)}
						on:click={deliverOrder}
						class="py-1 px-3 rounded items-center flex transition duration-300
            ease-in-out text-green-500 w-full lg:w-auto"
					>
						<Icon data={faClipboardCheck} class="mr-2 hidden lg:inline w-4 h-4" />
						<span>Marquer comme distribuée</span>
					</button>
				</div>
			</div>
		{/if}
		<div class="px-0 md:px-5 overflow-x-auto -mx-4 md:-mx-5">
			<div
				class="flex flex-wrap bg-white w-full items-top border
        border-gray-400"
			>
				<div
					class="w-full lg:w-2/6 px-4 lg:px-8 py-5 border-b lg:border-b-0
          lg:border-r border-solid border-gray-400"
				>
					<p class="uppercase font-bold pb-2">Commande</p>
					<div class="mt-3">
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-600">Référence :</span>
								{order.reference}
							</p>
						</div>
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-600">Passée le :</span>
								{format(new Date(order.createdOn), "PPPPp", { locale: fr })}
							</p>
						</div>
						{#if order.status == PurchaseOrderStatusKind.Delivered.Value}
							<div class="flex items-center mb-2">
								<p>
									{#if order.expectedDelivery.kind === DeliveryKind.ProducerToStore.Value}
										<span class="text-gray-600">Livrée le :</span>
									{:else}
										<span class="text-gray-600">Distribuée le :</span>
									{/if}
									{format(new Date(order.delivery.deliveredOn), "PPPPp", { locale: fr })}
								</p>
							</div>
						{/if}
					</div>
				</div>
				<div
					class="w-full lg:w-2/6 px-4 lg:px-8 py-5 border-b lg:border-b-0
          lg:border-r border-solid border-gray-400"
				>
					<p class="uppercase font-bold pb-2">Contenu</p>
					<div class="mt-3">
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-600">Articles :</span>
								{order.productsCount}
							</p>
						</div>
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-600">Montant TTC :</span>
								{formatMoney(order.totalOnSalePrice)}
								{#if order.totalReturnableOnSalePrice > 0}
									(dont {formatMoney(order.totalReturnableOnSalePrice)} consignes)
								{/if}
							</p>
						</div>
					</div>
				</div>
				<div
					class="w-full lg:w-2/6 border-b md:border-b-0 border-solid
          border-gray-400 px-4 lg:px-8 py-5"
				>
					<p class="uppercase font-bold pb-2">Client</p>
					<div class="mt-3">
						<div>
							<p class="mb-2">
								<span class="text-gray-600">Nom :</span>
								{order.sender.name}
							</p>
							<p class="text-base mb-2">
								<span class="text-gray-600">Mail :</span>
								<a href="mailto:{order.sender.email}">{order.sender.email}</a>
							</p>
							<p class="text-base mb-2">
								{#if order.sender.phone}
									<span class="text-gray-600">Tél :</span>
									<a href="tel:{order.sender.phone}">{order.sender.phone}</a>
								{/if}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		{#if order.comment && order.comment.length > 0}
			<div class="px-0 md:px-5 overflow-x-auto -mx-4 md:mx-0 bg-white border-t md:border border-gray-400">
				<div class=" px-4 py-5">
					<p class="uppercase font-bold pb-2">Remarques</p>
					<p>{order.comment}</p>
				</div>
			</div>
		{/if}
		<div class="px-0 md:px-5 overflow-x-auto -mx-4 md:-mx-5 md:mb-5">
			<div class="flex flex-wrap bg-white w-full lg:w-auto px-4 lg:px-8">
				<div class="w-full">
					<section>
						<div class="-mx-4 lg:-mx-8">
							<table class="min-w-full leading-normal">
								<thead>
									<tr>
										<th
											class="px-4 md:px-8 py-3 border-b border-l border-gray-400
                      bg-gray-100 text-left text-xs font-semibold text-gray-600
                      uppercase tracking-wider"
										>
											Produit
										</th>
										<th
											class="px-4 md:px-8 py-3 border-b border-gray-400
                      bg-gray-100 text-left text-xs font-semibold text-gray-600
                      uppercase tracking-wider hidden md:table-cell"
										>
											PU HT
										</th>
										<th
											class="px-4 md:px-8 py-3 border-b border-gray-400
                      bg-gray-100 text-center md:text-left text-xs font-semibold
                      text-gray-600 uppercase tracking-wider"
										>
											Qté
										</th>
										<th
											class="px-4 md:px-8 py-3 border-b border-gray-400
                      bg-gray-100 text-center md:text-left text-xs font-semibold
                      text-gray-600 uppercase tracking-wider"
										>
											TVA
										</th>
										<th
											class="px-4 md:px-8 py-3 border-b border-r border-gray-400
                      bg-gray-100 text-right text-xs font-semibold text-gray-600
                      uppercase tracking-wider"
										>
											Total TTC
										</th>
									</tr>
								</thead>
								<tbody>
									{#each order.products as line, index}
										<tr>
											<td
												class="px-4 md:px-8 py-5 border-b border-l border-gray-400
                        bg-white text-sm lg:text-base"
											>
												<div class="items-center">
													<p>{line.name}</p>
													<p class="whitespace-no-wrap block lg:hidden">
														{formatMoney(line.unitWholeSalePrice)}
													</p>
													<p class="text-gray-600 whitespace-no-wrap">
														#{line.reference}
													</p>
												</div>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base hidden md:table-cell"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(line.unitWholeSalePrice)}
												</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
												<p class="whitespace-no-wrap">{line.quantity}</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-gray-400
                        bg-white text-sm lg:text-base text-center md:text-left"
											>
												<p class="whitespace-no-wrap">{line.vat}%</p>
											</td>
											<td
												class="px-4 md:px-8 py-5 border-b border-r border-gray-400
                        bg-white text-sm lg:text-base text-right"
											>
												<p class="whitespace-no-wrap">
													{formatMoney(line.totalProductOnSalePrice)}
												</p>
												{#if line.totalReturnableOnSalePrice > 0}
													<p class="text-blue-500 whitespace-no-wrap">
														<img
															src="./img/returnable.svg"
															alt="Consigné"
															class="mr-1"
															style="width: 15px; display: inline;"
														/>
														{formatMoney(line.totalReturnableOnSalePrice)}
													</p>
												{/if}
											</td>
										</tr>
									{/each}
									<tr>
										<td
											class="border-b border-gray-400 border-l bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:hidden table-cell"
											colSpan="3"
										>
											Total HT:
										</td>
										<td
											class="border-b border-gray-400 border-l bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:table-cell hidden"
											colSpan="4"
										>
											Total HT:
										</td>
										<td
											class="border-b border-gray-400 bg-white px-4 md:px-8
                      py-5 text-lg text-right font-bold col-span-1 border-r"
											colSpan="1"
										>
											{formatMoney(order.totalWholeSalePrice)}
										</td>
									</tr>
									<tr>
										<td
											class="border-b border-gray-400 border-l bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:hidden table-cell"
											colspan="3"
										>
											Total TVA:
										</td>
										<td
											class="border-b border-gray-400 border-l bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:table-cell hidden"
											colspan="4"
										>
											Total TVA:
										</td>
										<td
											class="border-b border-gray-400 bg-white px-4 md:px-8
                      py-5 text-lg text-right font-bold col-span-1 border-r"
											colspan="1"
										>
											{formatMoney(order.totalVatPrice)}
										</td>
									</tr>
									<tr>
										<td
											class="border-b border-gray-400 border-l bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:hidden table-cell"
											colspan="3"
										>
											Total TTC:
										</td>
										<td
											class="border-b border-gray-400 border-l bg-white px-4 md:px-8
                      py-5 text-lg text-right uppercase font-semibold md:table-cell hidden"
											colspan="4"
										>
											Total TTC:
										</td>
										<td
											class="border-b border-gray-400 bg-white px-4 md:px-8
                      py-5 text-lg text-right font-bold col-span-1 border-r"
											colspan="1"
										>
											{formatMoney(order.totalOnSalePrice)}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</section>
				</div>
			</div>
		</div>
	</PageBody>
</TransitionWrapper>
