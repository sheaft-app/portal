<script>
	import { onMount, onDestroy, getContext } from "svelte";
	import { fly, slide } from "svelte/transition";
  import InputCheckbox from "./../../components/controls/InputCheckbox.svelte";
  import { cartItems } from "./../../stores/app.js";
  import { formatMoney } from "./../../helpers/app.js";
	import FacturationForm from "./FacturationForm.svelte";
	import PaymentInfoForm from "./PaymentInfoForm.svelte";
  import GetGraphQLInstance from "../../services/SheaftGraphQL";
  import GetRouterInstance from "../../services/SheaftRouter";
	import SheaftErrors from "../../services/SheaftErrors";
	import { GET_MY_CONSUMER_LEGALS, GET_ORDER } from "./queries";
	import { PAY_ORDER, CREATE_CONSUMER_LEGALS, UPDATE_CONSUMER_LEGALS } from "./mutations";
	import Loader from "../../components/Loader.svelte";
  import { authUserAccount } from "./../../stores/auth.js";
  import MangoPayInfo from "./MangoPayInfo.svelte";
  import CartRoutes from "./routes";
	import SearchProductsRoutes from "../search-products/routes";
	import ErrorCard from "../../components/ErrorCard.svelte";
  import Icon from "svelte-awesome";
	import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
  import formatISO from "date-fns/formatISO";

  const errorsHandler = new SheaftErrors();
	const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();
  const { open } = getContext("modal");

	let step = 1, acceptCgv = false;

	let isLoading = true;
	let userLegalsFound = false;
	let facturationFormInvalid = false;
	let isSavingLegals = false;
	let legalId = null;
	let isPaying = false;
	let paymentError = null;

	let user = {
    firstName: null,
    lastName: null,
    birthDate: null,
		nationality: null,
		countryOfResidence: null,
    email: null,
    address: {
      line1: null,
      line2: null,
      city: null,
			zipcode: null,
			country: null
		}
	};

  const showTransactionInfo = () => {
    open(MangoPayInfo, {});
	};
	
	let order = JSON.parse(
		localStorage.getItem("user_current_order")
	);

	onMount(async () => {
		if (!order) {
			// todo : terminée, envoyer une notif
			if ($cartItems.length > 0) {
				return routerInstance.goTo(CartRoutes.Resume);
			} else {
				return routerInstance.goTo(SearchProductsRoutes.Search);
			}
		}

		const values = routerInstance.getQueryParams();
		
		paymentError = values["message"] || null;

		var resOrder = await graphQLInstance.query(GET_ORDER, { input: order.id }, errorsHandler.Uuid);

		if (!resOrder.success) {
			isLoading = false;
			return;
		}

		order = resOrder.data;

		var resLegals = await graphQLInstance.query(GET_MY_CONSUMER_LEGALS, {}, errorsHandler.Uuid);

		if (!resLegals.success) {
			userLegalsFound = false;
			isLoading = false;
			return;
		}

		user = resLegals.data.owner;
		legalId = resLegals.data.id;
		userLegalsFound = true;
		step = 2;
		isLoading = false;
	})

	const handleSubmit = async () => {
		isPaying = true;
		var res = await graphQLInstance.mutate(PAY_ORDER, { id: order.id }, errorsHandler.Uuid);

		if (!res.success) {
			// todo
			isPaying = false;
			return;
		}

		localStorage.setItem("user_last_transaction", res.data.identifier);

		window.location = res.data.redirectUrl;
	}

	const handleSubmitLegals = async () => {
		isSavingLegals = true;

		const dateParts = user.birthDate.trim().split("/");
		let consumerLegalsMutation = UPDATE_CONSUMER_LEGALS;

		let variables = {
			...user,
			address: {
				...user.address,
				country: user.address.country.code
			},
			countryOfResidence: user.countryOfResidence.code,
			nationality: user.nationality.code,
			id: legalId,
			birthDate: formatISO(new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]))
		}

		if (!legalId) {
			consumerLegalsMutation = CREATE_CONSUMER_LEGALS;
			variables = {
				...variables,
				userId: $authUserAccount.profile.sub
			}
			delete variables['id'];
		}

		var res = await graphQLInstance.mutate(consumerLegalsMutation, variables, errorsHandler.Uuid);

		if (!res.success) {
			// todo
			isSavingLegals = false;
			return;
		}

		user = res.data.owner;
		isSavingLegals = false;
		++step;
	}
</script>


{#if isLoading}
	<Loader />
{:else}
	{#if paymentError}
		<div class="text-center lg:text-left mb-5" style="word-break: break-word;">
			<p>{paymentError}</p>
			<p class="mt-2">Si le problème persiste, contactez le service technique.</p>
			<button class="btn btn-lg btn-accent m-auto lg:m-0" on:click={handleSubmit}>Réessayer</button>
		</div>
	{/if}
	<ErrorCard {errorsHandler} />
	<div class="flex flex-wrap justify-between -mx-4 -my-4 lg:mx-0 lg:my-0" in:fly|local={{ x: 300, duration: 300 }}>
		<div class="w-full lg:w-7/12">
			{#if step == 1}
				<div in:fly|local={{ x: 300, duration: 300 }}>
					<FacturationForm bind:user bind:invalid={facturationFormInvalid} {errorsHandler} />
				</div>
			{:else if step == 2}
				<div in:fly|local={{ x: 300, duration: 300 }}>
					<PaymentInfoForm bind:user {order} bind:step {isSavingLegals} {errorsHandler} />
				</div>
			{/if}
		</div>
		<div class="w-full lg:w-4/12">
			<div
				class="py-2 lg:mb-6 pb-5 px-6 lg:px-6 lg:py-8 static lg:block bg-white
				shadow w-full border-t border-gray-400 lg:border-none lg:mt-0"
				style="height: fit-content;">
				<div>
					<div class="flex justify-between w-full lg:px-3 pb-2">
						<div class="text-left">
							<p>Panier</p>
							<p class="text-sm text-gray-600">
								{order.productsCount} articles
							</p>
						</div>
						<div>
							<p class="font-medium">{formatMoney(order.totalOnSalePrice)}</p>
						</div>
					</div>
					{#if order.returnablesCount >= 1}
						<div class="flex justify-between w-full lg:px-3 pb-2">
							<div class="text-left">
								<p>Consignes</p>
								<p class="text-sm text-gray-600">
									{order.returnablesCount} consignes
								</p>
							</div>
							<div>
								<p class="font-medium">{formatMoney(order.totalReturnableOnSalePrice)}</p>
							</div>
						</div>
					{/if}
					<div class="flex justify-between w-full lg:px-3 pb-2">
						<div class="text-left">
							<p>Frais bancaires</p>
							<p class="leading-none text-gray-600 text-sm"><button class="btn-link" on:click={showTransactionInfo}>C'est quoi ?</button></p>
						</div>
						<div>
							<p class="font-medium">{formatMoney(order.totalFees)}</p>
						</div>
					</div>
					{#if order.donation > 0}
						<div class="flex justify-between w-full lg:px-3 pb-2">
							<div class="text-left">
								<p>Don</p>
							</div>
							<div>
								<p class="font-medium">{formatMoney(order.donation)}</p>
							</div>
						</div>
					{/if}
					<div class="flex justify-between w-full lg:px-3 border-gray-300 pt-2">
						<div class="text-left">
							<p class="uppercase font-semibold">Total</p>
						</div>
						<div>
							<p class="font-bold text-lg">{formatMoney(order.totalPrice)}</p>
						</div>
					</div>
					{#if step == 2}
						<div class="pt-4 pb-8 lg:px-2" in:slide>
							<label class="cursor-pointer">
								<InputCheckbox
									checked={acceptCgv}
									onClick={() => (acceptCgv = !acceptCgv)} />
								Je reconnais avoir lu et compris
								<a href="https://www.sheaft.com/legals" target="_blank">
									les CGV
								</a>
								et je les accepte
							</label>
						</div>
					{/if}
					<div class="border-t border-gray-400 mt-3 pt-3">
						{#if step == 2}
							<button
								type="button"	
								on:click={handleSubmit}
								disabled={!acceptCgv || isPaying}
								class:disabled={!acceptCgv || isPaying}
								class="btn btn-primary btn-lg uppercase w-full lg:w-8/12
								justify-center m-auto"
								style="padding-left: 50px; padding-right: 50px;">
								{#if isPaying}
									<Icon data={faCircleNotch} spin />
								{:else}
									Passer la commande
								{/if}
							</button>
						{:else}
							<button
								type="button"
								on:click={handleSubmitLegals}
								class:disabled={isSavingLegals || facturationFormInvalid}
								class="btn btn-accent btn-lg uppercase w-full lg:w-8/12
								justify-center m-auto"
								style="padding-left: 50px; padding-right: 50px;">
								Suivant
							</button>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}