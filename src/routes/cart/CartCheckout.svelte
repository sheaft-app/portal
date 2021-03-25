<script>
	import { onMount, getContext } from "svelte";
	import { fly } from "svelte/transition";
	import cart from "./../../stores/cart.js";
	import { formatMoney } from "./../../helpers/app.js";
	import FacturationForm from "./FacturationForm.svelte";
	import PaymentInfoForm from "./PaymentInfoForm.svelte";
	import GetGraphQLInstance from "../../services/SheaftGraphQL";
	import GetRouterInstance from "../../services/SheaftRouter";
	import SheaftErrors from "../../services/SheaftErrors";
	import { GET_MY_CONSUMER_LEGALS } from "./queries";
	import {
		PAY_ORDER,
		CREATE_CONSUMER_LEGALS,
		UPDATE_CONSUMER_LEGALS,
	} from "./mutations";
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

	let step = 1;

	let isLoading = true;
	let userLegalsFound = false;
	let facturationFormInvalid = false;
	let isSavingLegals = false;
	let legalId = null;
	let isPaying = false;
	let paymentError = null;

	let user = {
		firstName: $authUserAccount.profile.given_name,
		lastName: $authUserAccount.profile.family_name,
		birthDate: null,
		nationality: null,
		countryOfResidence: "FR",
		email: $authUserAccount.profile.email,
		address: {
			line1: null,
			line2: null,
			city: null,
			zipcode: null,
			country: "FR",
		},
	};

	const showTransactionInfo = () => {
		open(MangoPayInfo, {});
	};

	onMount(async () => {
		if (!$cart.userCurrentOrder || $cart.products.length <= 0) {
			// todo : terminée, envoyer une notif
			if ($cart.products.length > 0) {
				return routerInstance.goTo(CartRoutes.Resume);
			} else {
				return routerInstance.goTo(SearchProductsRoutes.Search);
			}
		}

		const values = routerInstance.getQueryParams();

		paymentError = values["message"] || null;

		var resLegals = await graphQLInstance.query(
			GET_MY_CONSUMER_LEGALS,
			{},
			errorsHandler.Uuid
		);

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
	});

	const handleSubmit = async () => {
		isPaying = true;
		var res = await graphQLInstance.mutate(
			PAY_ORDER,
			{ id: $cart.userCurrentOrder },
			errorsHandler.Uuid
		);

		if (!res.success) {
			// todo
			isPaying = false;
			return;
		}

		localStorage.setItem("user_last_transaction", res.data.identifier);
		window.location = res.data.redirectUrl;
	};

	const handleSubmitLegals = async () => {
		isSavingLegals = true;

		const dateParts = user.birthDate.trim().split("/");
		let consumerLegalsMutation = UPDATE_CONSUMER_LEGALS;

		let variables = {
			...user,
			address: {
				...user.address,
				country: user.address.country.code,
			},
			countryOfResidence: user.countryOfResidence.code,
			nationality: user.nationality.code,
			id: legalId,
			birthDate: formatISO(
				new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
			),
		};

		if (!legalId) {
			consumerLegalsMutation = CREATE_CONSUMER_LEGALS;
			variables = {
				...variables,
				userId: $authUserAccount.profile.sub,
			};
			delete variables["id"];
		}

		var res = await graphQLInstance.mutate(
			consumerLegalsMutation,
			variables,
			errorsHandler.Uuid
		);

		if (!res.success) {
			// todo
			isSavingLegals = false;
			return;
		}

		user = res.data.owner;
		legalId = res.data.id;
		isSavingLegals = false;
		++step;

		graphQLInstance.clearApolloCache(res.data.id);
	};
</script>

{#if isLoading}
	<Loader />
{:else}
	{#if paymentError}
		<div class="mb-10 p-4 bg-red-500 text-white text-center lg:text-left">
			<p class="mb-2">{paymentError}</p>
			<p class="mb-2">
				Vous pouvez réessayer. Si vous pensez que cette erreur n'est pas liée à votre carte, contactez le service technique.
			</p>
			<button
				class="btn btn-lg btn-white m-auto lg:m-0"
				disabled={isPaying}
				class:disabled={isPaying}
				on:click={handleSubmit}>Réessayer</button>
		</div>
	{/if}
	<ErrorCard {errorsHandler} />
	<div
		class="flex flex-wrap justify-between -mx-4 -my-4 lg:mx-0 lg:my-0"
		in:fly|local={{ x: 300, duration: 300 }}>
		<div class="w-full lg:w-7/12">
			{#if step == 1}
				<div in:fly|local={{ x: 300, duration: 300 }}>
					<FacturationForm
						bind:user
						bind:invalid={facturationFormInvalid}
						{errorsHandler} />
				</div>
			{:else if step == 2}
				<div in:fly|local={{ x: 300, duration: 300 }}>
					<PaymentInfoForm
						bind:user
						bind:step
						{isSavingLegals}
						{errorsHandler} />
				</div>
			{/if}
		</div>
		<div class="w-full lg:w-4/12">
			<div
				class="py-2 lg:mb-6 pb-5 px-5 lg:px-6 lg:py-8 static lg:block bg-white
					shadow w-full border-t border-gray-400 lg:border-none lg:mt-0"
				style="height: fit-content;">
				<div>
					<div class="flex justify-between w-full lg:px-3 pb-2">
						<div class="text-left">
							<p>Panier</p>
							<p class="text-sm text-gray-600">
								{$cart.productsCount} articles
								{#if $cart.returnablesCount >= 1}
									dont {$cart.returnablesCount} consigné{$cart.returnablesCount > 1 ? 's' : ''}
								{/if}
							</p>
						</div>
						<div class="text-right">
							<p class="font-medium">{formatMoney($cart.totalOnSalePrice)}</p>
							{#if $cart.returnablesCount >= 1}
								<p class="text-blue-500 font-medium text-sm">
									dont 
									<img src="./img/returnable.svg" alt="consigne" style="width: 15px; display: inline;"  /> 
									{formatMoney($cart.totalReturnableOnSalePrice)}
								</p>
							{/if}
						</div>
					</div>
					<div class="flex justify-between w-full lg:px-3 pb-2">
						<div class="text-left">
							<p>Frais bancaires</p>
							<p class="leading-none text-gray-600 text-sm">
								<button class="btn-link" on:click={showTransactionInfo}>C'est
									quoi ?</button>
							</p>
						</div>
						<div>
							<p class="font-medium">{formatMoney($cart.totalFees)}</p>
						</div>
					</div>
					{#if $cart.donation > 0}
						<div class="flex justify-between w-full lg:px-3 pb-2">
							<div class="text-left">
								<p>Don</p>
							</div>
							<div>
								<p class="font-medium">{formatMoney($cart.donation)}</p>
							</div>
						</div>
					{/if}
					<div
						class="flex justify-between w-full lg:px-3 border-t border-gray-400
							pt-2">
						<div class="text-left">
							<p class="uppercase font-semibold">Total</p>
						</div>
						<div>
							<p class="font-bold text-lg">{formatMoney($cart.totalPrice)}</p>
						</div>
					</div>
					<div class="mt-3">
						{#if step == 2}
							<button
								type="button"
								on:click={handleSubmit}
								disabled={isPaying}
								class:disabled={isPaying}
								class="btn btn-primary btn-lg uppercase w-full lg:w-8/12
									justify-center m-auto"
								style="padding-left: 50px; padding-right: 50px;">
								{#if isPaying}
									<Icon data={faCircleNotch} spin />
								{:else}Passer la commande{/if}
							</button>
						{:else}
							<button
								type="button"
								on:click={handleSubmitLegals}
								class:disabled={isSavingLegals || facturationFormInvalid}
								class="btn btn-accent btn-lg uppercase w-full lg:w-8/12
									justify-center m-auto"
								style="padding-left: 50px; padding-right: 50px;">
								Suivant {#if isSavingLegals}
									<Icon data={faCircleNotch} spin class="ml-2" />
								{/if}
							</button>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
