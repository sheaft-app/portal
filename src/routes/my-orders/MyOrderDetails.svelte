<script>
	import CancelMyOrders from "./CancelMyOrders.svelte";
	import { onMount, getContext } from "svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetAuthInstance from "./../../services/SheaftAuth";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import PurchaseOrderStatusKind from "../../enums/PurchaseOrderStatusKind";
	import Roles from "./../../enums/Roles";
	import MyOrderRoutes from "./routes";
	import { GET_MY_ORDER_DETAILS } from "./queries.js";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import Icon from "svelte-awesome";
	import { faTruck, faCheck, faCalendar, faMapMarkerAlt, faClock } from "@fortawesome/free-solid-svg-icons";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import DeliveryStatus from "../../enums/DeliveryStatus";
	import { formatMoney } from "./../../helpers/app";
	import { timeSpanToFrenchHour, encodeQuerySearchUrl } from "../../helpers/app";
	import { querystring } from "svelte-spa-router";
	import PurchaseOrderProductsTable from "./../../components/products-table/PurchaseOrderProductsTable.svelte";
	import ExpectedDeliveriesRoutes from "./../expected-deliveries/routes";

	export let params = {};

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query } = getContext("api");
	const authInstance = GetAuthInstance();
	const routerInstance = GetRouterInstance();

	let purchaseOrder = null;
	let processStep = null;
	let isLoading = true;

	const getProcessStep = (status, deliveryStatus) => {
		switch (status) {
			case PurchaseOrderStatusKind.Accepted.Value:
				return 1;
			case PurchaseOrderStatusKind.Processing.Value:
				return 2;
			case PurchaseOrderStatusKind.Completed.Value:
				if (deliveryStatus && deliveryStatus !== DeliveryStatus.Delivered) return 4;
				return 3;
			case PurchaseOrderStatusKind.Delivered.Value:
				return 5;
			default:
				return 0;
		}
	};

	const cancelOrder = () =>
		open(CancelMyOrders, {
			orders: [purchaseOrder],
			onClose: (res) => {
				if (res.success) routerInstance.refresh();
			},
		});

	onMount(async () => {
		if (!params.id) {
			await routerInstance.goTo(MyOrderRoutes.List);
			return;
		}

		await getOrder();
	});

	const getOrder = async () => {
		isLoading = true;
		purchaseOrder = await query({
			query: GET_MY_ORDER_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(MyOrderRoutes.List),
			errorNotification: "La commande à laquelle vous essayez d'accéder n'existe plus",
			skipCache: routerInstance.shouldSkipCache(),
		});

		processStep = getProcessStep(purchaseOrder.status, purchaseOrder.delivery?.status);
		isLoading = false;
	};

	$: getOrder($querystring);

	$: canCancelOrder =
		purchaseOrder &&
		purchaseOrder.status != PurchaseOrderStatusKind.Completed.Value &&
		purchaseOrder.status != PurchaseOrderStatusKind.Cancelled.Value &&
		purchaseOrder.status != PurchaseOrderStatusKind.Withdrawned.Value &&
		purchaseOrder.status != PurchaseOrderStatusKind.Delivered.Value &&
		purchaseOrder.status != PurchaseOrderStatusKind.Processing.Value &&
		purchaseOrder.status != PurchaseOrderStatusKind.Refused.Value &&
		purchaseOrder.status != PurchaseOrderStatusKind.Expired.Value;
</script>

<TransitionWrapper>
	<PageHeader name="Détails de la commande" previousPage={MyOrderRoutes.List} />
	<PageBody {errorsHandler} {isLoading} loadingMessage="Récupération des informations de votre commande en cours.">
		{#if purchaseOrder.status === PurchaseOrderStatusKind.Expired.Value}
			<div
				class="py-5 px-8 md:px-5 overflow-x-auto -mx-4 md:mx-0 bg-gray-100
        shadow rounded mb-3"
			>
				<p class="uppercase font-bold leading-none">Commande expirée</p>
				<div class="mt-2">
					<p>La commande est expirée, vous ne pouvez plus interagir avec.</p>
					{#if purchaseOrder.reason}
						<p class="mt-2 font-semibold">Raison : {purchaseOrder.reason}</p>
					{/if}
				</div>
			</div>
		{/if}
		{#if purchaseOrder.status === PurchaseOrderStatusKind.Cancelled.Value || purchaseOrder.status === PurchaseOrderStatusKind.Withdrawned.Value}
			<div
				class="py-5 px-8 md:px-5 overflow-x-auto -mx-4 md:mx-0 bg-gray-100
        shadow rounded mb-3"
			>
				<p class="uppercase font-bold leading-none">Commande annulée</p>
				<div class="mt-2">
					<p>La commande a été annulée, vous ne pouvez plus interagir avec.</p>
					{#if purchaseOrder.reason}
						<p class="mt-2 font-semibold">Raison : {purchaseOrder.reason}</p>
					{/if}
				</div>
			</div>
		{/if}
		{#if purchaseOrder.status === PurchaseOrderStatusKind.Refused.Value}
			<div
				class="py-5 px-8 md:px-5 overflow-x-auto -mx-4 md:mx-0 bg-red-100
        shadow rounded mb-3"
			>
				<p class="uppercase font-bold leading-none">Commande refusée</p>
				<div class="mt-2">
					<p>La commande a été refusée, vous ne pouvez plus interagir avec.</p>
					{#if purchaseOrder.reason}
						<p class="mt-2 font-semibold">Raison : {purchaseOrder.reason}</p>
					{/if}
				</div>
			</div>
		{/if}
		{#if purchaseOrder.status === PurchaseOrderStatusKind.Waiting.Value}
			<div
				class="py-5 px-5 overflow-x-auto -mx-4 md:mx-0 bg-blue-100 shadow
        rounded mb-3"
			>
				<p class="uppercase font-bold leading-none">Votre commande est en cours de traitement</p>
				<div class="mt-2">
					<p>
						Votre commande a été envoyée au producteur. Celui-ci doit maintenant définir s'il est apte à la
						traiter en fonction de son stock et de sa capacité de production.
					</p>
					<p>Vous recevrez un e-mail dès l'instant où le producteur aura accepté votre commande.</p>
				</div>
			</div>
		{/if}
		{#if purchaseOrder.status === PurchaseOrderStatusKind.Delivered.Value}
			<div
				class="py-5 px-5 overflow-x-auto -mx-4 md:mx-0 bg-green-100 shadow
        rounded mb-3"
			>
				{#if authInstance.isInRole([Roles.Store.Value])}
					<p class="uppercase font-bold leading-none">Commande livrée</p>
					<div class="mt-2">
						<p>Cette commande vous a été livrée.</p>
					</div>
				{:else}
					<p class="uppercase font-bold leading-none">Commande récupérée</p>
					<div class="mt-2">
						<p>Vous avez récupéré cette commande.</p>
					</div>
				{/if}
			</div>
		{/if}
		{#if purchaseOrder.status !== PurchaseOrderStatusKind.Refused.Value && purchaseOrder.status !== PurchaseOrderStatusKind.Cancelled.Value && purchaseOrder.status !== PurchaseOrderStatusKind.Withdrawned.Value && purchaseOrder.status !== PurchaseOrderStatusKind.Delivered.Value && purchaseOrder.status !== PurchaseOrderStatusKind.Expired.Value && purchaseOrder.expectedDelivery.expectedDeliveryDate}
			<div
				class="py-5 px-5 overflow-x-auto -mx-4 md:mx-0 bg-white shadow
        md:rounded md:mb-3 border-t md:border-none border-gray-400"
			>
				<div class="flex">
					<Icon data={faTruck} scale="1" class="mr-5" />
					<div>
						{#if authInstance.isInRole([Roles.Store.Value])}
							<p class="uppercase font-bold leading-none">Livraison de la commande</p>
							<div class="mt-2">
								<p class="leading-none">
									{#if purchaseOrder.status === PurchaseOrderStatusKind.Waiting.Value}
										Si votre commande est acceptée, la livraison aura lieu le
									{:else}Votre commande sera livrée le
									{/if}
									<b>
										{format(
											new Date(
												purchaseOrder.delivery && purchaseOrder.delivery.scheduledOn
													? purchaseOrder.delivery.scheduledOn
													: purchaseOrder.expectedDelivery.expectedDeliveryDate
											),
											"PPPP",
											{
												locale: fr,
											}
										)}
									</b>
								</p>
							</div>
						{:else}
							<p class="uppercase font-bold leading-none">Où et quand récupérer ma commande ?</p>
							<div class="mt-3">
								<div class="flex mb-2">
									<Icon data={faMapMarkerAlt} class="mr-3 w-3 h-3" style="margin-top: 0.5em;" />
									<div>
										<p>{purchaseOrder.expectedDelivery.address.line1}</p>
										{#if purchaseOrder.expectedDelivery.address.line2}
											<p>{purchaseOrder.expectedDelivery.address.line2}</p>
										{/if}
										<p>
											{purchaseOrder.expectedDelivery.address.zipcode}
											{purchaseOrder.expectedDelivery.address.city}
										</p>
									</div>
								</div>
								<div class="mb-3">
									<p class="mb-1">
										<Icon data={faCalendar} class="mr-2 w-3 h-3" />
										{format(new Date(purchaseOrder.expectedDelivery.expectedDeliveryDate), "PPPP", {
											locale: fr,
										})}
									</p>
									<p class="mb-1">
										<Icon data={faClock} class="mr-2 w-3 h-3" />
										entre
										{timeSpanToFrenchHour(purchaseOrder.expectedDelivery.from)}
										et
										{timeSpanToFrenchHour(purchaseOrder.expectedDelivery.to)}
									</p>
								</div>
								<a
									target="_blank"
									class="btn btn-lg btn-accent font-semibold mt-2"
									style="width: max-content;"
									href={`https://www.google.com/maps/search/?api=1&query=${encodeQuerySearchUrl(
										purchaseOrder.expectedDelivery.address
									)}`}
								>
									Voir sur Google Maps
								</a>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}
		{#if purchaseOrder.status !== PurchaseOrderStatusKind.Cancelled.Value && purchaseOrder.status !== PurchaseOrderStatusKind.Withdrawned.Value && purchaseOrder.status !== PurchaseOrderStatusKind.Refused.Value && purchaseOrder.status !== PurchaseOrderStatusKind.Expired.Value}
			<div
				class="px-0 py-5 md:py-0 md:px-5 overflow-x-auto -mx-4 md:mx-0 bg-white
        border-t md:border-l md:border-r border-gray-400"
			>
				<div class="md-stepper-horizontal green mb-5">
					<div class="md-step p-0 md:p-6" class:active={processStep >= 1}>
						<div class="md-step-circle">
							{#if processStep <= 1}
								1
							{:else}
								<Icon data={faCheck} class="mb-1" />
							{/if}
						</div>
						<div class="md-step-title text-xs md:text-base">
							{purchaseOrder.status === PurchaseOrderStatusKind.Waiting.Value ? "En attente" : "Acceptée"}
						</div>
						<div class="md-step-bar-left hidden md:block" />
						<div class="md-step-bar-right hidden md:block" />
					</div>
					<div class="md-step p-0 md:p-6" class:active={processStep >= 2}>
						<div class="md-step-circle">
							{#if processStep <= 2}
								<span>2</span>
							{:else}
								<Icon data={faCheck} class="mb-1" />
							{/if}
						</div>
						<div class="md-step-title text-xs md:text-base">Préparation</div>
						<div class="md-step-optional" />
						<div class="md-step-bar-left hidden md:block" />
						<div class="md-step-bar-right hidden md:block" />
					</div>
					<div class="md-step p-0 md:p-6" class:active={processStep >= 3}>
						<div class="md-step-circle">
							{#if processStep <= 3}
								<span>3</span>
							{:else}
								<Icon data={faCheck} class="mb-1" />
							{/if}
						</div>
						<div class="md-step-title text-xs md:text-base">Prête</div>
						<div class="md-step-bar-left hidden md:block" />
						<div class="md-step-bar-right hidden md:block" />
					</div>
					{#if authInstance.isInRole( [Roles.Store.Value] ) && purchaseOrder.delivery && purchaseOrder.delivery.status !== DeliveryStatus.Delivered.Value}
						<div class="md-step p-0 md:p-6" class:active={processStep >= 4}>
							<div class="md-step-circle">
								{#if processStep <= 4 && purchaseOrder.status !== PurchaseOrderStatusKind.Delivered.Value}
									<span>4</span>
								{:else}
									<Icon data={faCheck} class="mb-1" />
								{/if}
							</div>
							<div class="md-step-title text-xs md:text-base">
								{DeliveryStatus.label(purchaseOrder.delivery.status)}
								{#if authInstance.isInRole([Roles.Store.Value])}
									<div>
										{#if (purchaseOrder.delivery.status === DeliveryStatus.Waiting.Value || purchaseOrder.delivery.status === DeliveryStatus.Ready.Value || purchaseOrder.delivery.status === DeliveryStatus.InProgress.Value)}
											(<a href="javascript:void(0)" on:click={() => routerInstance.goTo(ExpectedDeliveriesRoutes.Details, {id: purchaseOrder.delivery.id})}>Suivre la livraison</a>)
										{/if}
									</div>
								{/if}
							</div>
							<div class="md-step-bar-left hidden md:block" />
							<div class="md-step-bar-right hidden md:block" />
						</div>
					{/if}

					<div class="md-step p-0 md:p-6" class:active={processStep >= 5}>
						<div class="md-step-circle">
							{#if processStep < 5}
								<span
									>{authInstance.isInRole([Roles.Store.Value]) && purchaseOrder.delivery
										? 5
										: 4}</span
								>
							{:else}
								<Icon data={faCheck} class="mb-1" />
							{/if}
						</div>
						<div class="md-step-title text-xs md:text-base">
							{authInstance.isInRole([Roles.Store.Value]) ? "Livrée" : "Récupérée"}
							{#if authInstance.isInRole( [Roles.Store.Value] ) && purchaseOrder.status === PurchaseOrderStatusKind.Delivered.Value}
								<div>
									{#if purchaseOrder.delivery.status === DeliveryStatus.Delivered.Value}
										(<a href="javascript:void(0)" on:click={() => routerInstance.goTo(ExpectedDeliveriesRoutes.Details, {id: purchaseOrder.delivery.id})}>Voir la livraison</a>)
									{/if}
								</div>
							{/if}
						</div>
						<div class="md-step-bar-left hidden md:block" />
						<div class="md-step-bar-right hidden md:block" />
					</div>
				</div>
			</div>
		{/if}
		<div class="px-0 md:px-5 overflow-x-auto -mx-4 md:mx-0 bg-white border-t md:border border-gray-400">
			<div class="flex flex-wrap bg-white w-full items-top">
				<div
					class="w-full lg:w-3/6 px-4 py-5 border-b lg:border-b-0
          lg:border-r border-solid border-gray-400"
				>
					<p class="uppercase font-bold pb-2">Commande</p>
					<div class="mt-3">
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-600">Référence :</span>
								{purchaseOrder.reference}
							</p>
						</div>
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-600">Passée le :</span>
								{format(new Date(purchaseOrder.createdOn), "PPPPp", { locale: fr })}
							</p>
						</div>
						{#if purchaseOrder.status === PurchaseOrderStatusKind.Delivered.Value}
							<div class="flex items-center mb-2">
								<p>
									<span class="text-gray-600">Livrée le :</span>
									{format(new Date(purchaseOrder.delivery.deliveredOn), "PPPPp", { locale: fr })}
								</p>
							</div>
						{/if}
					</div>
				</div>
				<div
					class="w-full lg:w-3/6 border-b md:border-b-0 border-solid
          border-gray-400 px-4 py-5"
				>
					<p class="uppercase font-bold pb-2">Producteur</p>
					<div class="mt-3">
						<div>
							<p class="mb-2">
								<span class="text-gray-600">Nom :</span>
								{purchaseOrder.vendor.name}
							</p>
							<p class="text-base mb-2">
								<span class="text-gray-600">Mail :</span>
								<a href="mailto:{purchaseOrder.vendor.email}">{purchaseOrder.vendor.email}</a>
							</p>
							<p class="text-base mb-2">
								{#if purchaseOrder.vendor.phone}
									<span class="text-gray-600">Tél :</span>
									<a href="tel:{purchaseOrder.vendor.phone}">{purchaseOrder.vendor.phone}</a>
								{/if}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<PurchaseOrderProductsTable purchaseOrderId={purchaseOrder.id} />
		{#if canCancelOrder}
			<div class="bg-white shadow md:rounded overflow-hidden md:mb-3 -mx-4 md:mx-0">
				<div class="px-4 md:px-8 py-5">
					<p class="uppercase font-bold">Annuler la commande</p>
					<div class="mt-5">
						<p>Vous pouvez annuler votre commande tant que celle-ci n'est pas en cours de préparation.</p>
						<button on:click={cancelOrder} class="btn btn-lg btn-accent shadow mt-3 font-semibold">
							Annuler ma commande
						</button>
					</div>
				</div>
			</div>
		{/if}
	</PageBody>
</TransitionWrapper>

<style>
	.md-stepper-horizontal {
		display: table;
		width: 100%;
		margin: 0 auto;
	}

	.md-stepper-horizontal .md-step {
		display: table-cell;
		position: relative;
	}

	.md-stepper-horizontal .md-step:first-child .md-step-bar-left,
	.md-stepper-horizontal .md-step:last-child .md-step-bar-right {
		display: none;
	}

	.md-stepper-horizontal .md-step .md-step-circle {
		width: 30px;
		height: 30px;
		margin: 0 auto;
		background-color: #999999;
		border-radius: 50%;
		text-align: center;
		line-height: 30px;
		font-size: 16px;
		font-weight: 600;
		color: #ffffff;
	}

	.md-stepper-horizontal.green .md-step.active .md-step-circle {
		background-color: #00786a;
	}

	.md-stepper-horizontal.orange .md-step.active .md-step-circle {
		background-color: #f96302;
	}

	.md-stepper-horizontal .md-step.active .md-step-circle {
		background-color: rgb(33, 150, 243);
	}

	.md-stepper-horizontal .md-step.done .md-step-circle:before {
		font-family: "FontAwesome";
		font-weight: 100;
		content: "\f00c";
	}

	.md-stepper-horizontal .md-step.done .md-step-circle *,
	.md-stepper-horizontal .md-step.editable .md-step-circle * {
		display: none;
	}

	.md-stepper-horizontal .md-step.editable .md-step-circle {
		-moz-transform: scaleX(-1);
		-o-transform: scaleX(-1);
		-webkit-transform: scaleX(-1);
		transform: scaleX(-1);
	}

	.md-stepper-horizontal .md-step.editable .md-step-circle:before {
		font-family: "FontAwesome";
		font-weight: 100;
		content: "\f040";
	}

	.md-stepper-horizontal .md-step .md-step-title {
		margin-top: 16px;
		font-weight: 600;
	}

	.md-stepper-horizontal .md-step .md-step-title,
	.md-stepper-horizontal .md-step .md-step-optional {
		text-align: center;
		color: rgba(0, 0, 0, 0.26);
	}

	.md-stepper-horizontal .md-step.active .md-step-title {
		font-weight: 600;
		color: #205164;
	}

	.md-stepper-horizontal .md-step.active.done .md-step-title,
	.md-stepper-horizontal .md-step.active.editable .md-step-title {
		font-weight: 600;
	}

	.md-stepper-horizontal .md-step .md-step-optional {
		font-size: 12px;
	}

	.md-stepper-horizontal .md-step.active .md-step-optional {
		color: rgba(0, 0, 0, 0.54);
	}

	.md-stepper-horizontal .md-step .md-step-bar-left,
	.md-stepper-horizontal .md-step .md-step-bar-right {
		position: absolute;
		top: 36px;
		height: 1px;
		border-top: 1px solid #dddddd;
	}

	.md-stepper-horizontal .md-step .md-step-bar-right {
		right: 0;
		left: 50%;
		margin-left: 20px;
	}

	.md-stepper-horizontal .md-step .md-step-bar-left {
		left: 0;
		right: 50%;
		margin-right: 20px;
	}
</style>
