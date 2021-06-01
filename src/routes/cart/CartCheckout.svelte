<script>
	import { onMount, getContext } from "svelte";
	import { fly } from "svelte/transition";
	import cart, { card } from "./../../stores/cart.js";
	import { formatMoney } from "./../../helpers/app.js";
	import FacturationForm from "./FacturationForm.svelte";
	import SummaryForm from "./SummaryForm.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import SheaftErrors from "../../services/SheaftErrors";
	import { GET_MY_CONSUMER_LEGALS } from "./queries";
	import {
		CREATE_CONSUMER_LEGALS,
		UPDATE_CONSUMER_LEGALS,
		CREATE_CARD_REGISTRATION,
		CREATE_PRE_AUTHORIZATION,
	} from "./mutations";
	import Loader from "../../components/Loader.svelte";
	import { authUserAccount } from "./../../stores/auth.js";
	import MangoPayInfo from "./MangoPayInfo.svelte";
	import CartRoutes from "./routes";
	import SearchProductsRoutes from "../search-products/routes";
	import ErrorCard from "../../components/ErrorCard.svelte";
	import Icon from "svelte-awesome";
	import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
	import PreAuthorizationStatus from "../../enums/PreAuthorizationStatus";
	import mangoPay from "./../../../node_modules/mangopay-cardregistration-js-kit/kit/mangopay-kit.min.js";
	import CreditCard from "./CreditCard.svelte";
	import { normalizeUpdateLegals, normalizeCreateLegals } from "./cartForm";

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const { open } = getContext("modal");
	const { query, mutate, clearApolloCache } = getContext("api");

	let step = 1;

	let isLoading = true;
	let userLegalsFound = false;
	let facturationFormInvalid = false;
	let isSavingLegals = false;
	let legalId = null;
	let isPaying = false;
	let cardError = null;
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

	const showTransactionInfo = () => open(MangoPayInfo, {});

	$: if (!$cart.isInitializing && (!$cart.userCurrentOrder || $cart.products.length <= 0)) {
		// todo : terminée, envoyer une notif
		if ($cart.products.length > 0) {
			routerInstance.goTo(CartRoutes.Resume);
		} else {
			routerInstance.goTo(SearchProductsRoutes.Search);
		}
	}

	onMount(async () => {
		const values = routerInstance.getQueryParams();

		paymentError = values["message"] || null;
		await query({
			query: GET_MY_CONSUMER_LEGALS,
			errorsHandler,
			success: (res) => {
				if (res) {
					user = res.owner;
					legalId = res.id;
					userLegalsFound = true;
					step = 2;
				} else userLegalsFound = false;
			},
			error: () => (userLegalsFound = false),
		});
		isLoading = false;
	});

	const handleSubmit = async () => {
		isPaying = true;
		cardError = null;

		await createCardRegistration($authUserAccount.profile.id);

		$card.data.cardExpirationDate = `${$card.month.toString()}${$card.year.toString().substring(2)}`;
		$card.data.cardCvx = $card.data.cardCvx.toString();

		mangoPay.cardRegistration.registerCard(
			{
				...$card.data,
				cardNumber: $card.data.cardNumber.toString().replace(/\s/g, ""),
			},
			async (res) => {
				await mutate({
					mutation: CREATE_PRE_AUTHORIZATION,
					variables: {
						id: $cart.userCurrentOrder,
						cardIdentifier: res.CardId,
						browserInfo: {
							colorDepth: screen.colorDepth == 30 ? 24 : screen.colorDepth, // fixos macOS chrome de la muerte
							javaEnabled: navigator.javaEnabled(),
							javascriptEnabled: true,
							language: navigator.language,
							screenHeight: window.screen.height,
							screenWidth: window.screen.width,
							timeZoneOffset: new Date().getTimezoneOffset().toString(),
							userAgent: navigator.userAgent,
						},
					},
					errorsHandler,
					success: (result) => {
						if (result.status == PreAuthorizationStatus.Failed) {
							isPaying = false;
							//TODO handle authorization error
							return;
						}

						if (result.secureModeRedirectURL) {
							window.location = result.secureModeRedirectURL;
							return;
						} else {
							isPaying = false;
							return routerInstance.goTo({
								Path: CartRoutes.Success.Path,
								Params: {
									Query: {
										id: $cart.userCurrentOrder,
									},
								},
							});
						}
					},
					errorNotification: "Une erreur est survenue pendant le paiement. Veuillez réessayer ou contacter le support.",
				});
				isPaying = false;
			},
			async (response) => {
				isPaying = false;

				switch (response.ResultMessage) {
					case "PAST_EXPIRY_DATE_ERROR":
						cardError = "La date d'expiration de votre carte est passée.";
						break;
					default:
						cardError = "Les informations de votre carte ne sont pas valides.";
						break;
				}
			}
		);
	};

	const createCardRegistration = async (userId) =>
		await mutate({
			mutation: CREATE_CARD_REGISTRATION,
			variables: { userId },
			errorsHandler,
			success: async (res) => {
				await mangoPay.cardRegistration.init({
					cardRegistrationURL: res.url,
					preregistrationData: res.preRegistrationData,
					accessKey: res.accessKey,
					Id: res.identifier,
				});
			},
			errorNotification: "Impossible de traiter les informations de votre carte.",
		});

	const handleSubmitLegals = async () => {
		isSavingLegals = true;
		await mutate({
			mutation: legalId ? UPDATE_CONSUMER_LEGALS : CREATE_CONSUMER_LEGALS,
			variables: legalId ? normalizeUpdateLegals({ user, id: legalId }) : normalizeCreateLegals(user),
			errorsHandler,
			success: (res) => {
				legalId = res.id;
				user = res.owner;
				++step;
			},
			errorNotification: "Impossible d'enregistrer vos informations de facturation",
		});
		clearApolloCache(user.id);
	};

</script>

{#if isLoading}
	<Loader />
{:else}
	{#if paymentError}
		<div class="mb-10 p-4 bg-red-500 text-white text-center lg:text-left">
			<p class="mb-2">{paymentError}</p>
			<p class="mb-2">
				Vous pouvez réessayer. Si vous pensez que cette erreur n'est pas liée à votre carte, contactez le service
				technique.
			</p>
			<button
				class="btn btn-lg btn-white m-auto lg:m-0"
				disabled={isPaying}
				class:disabled={isPaying}
				on:click={handleSubmit}>Réessayer</button
			>
		</div>
	{/if}
	<div class="flex flex-wrap justify-between -mx-4 -my-4 lg:mx-0 lg:my-0" in:fly|local={{ x: 300, duration: 300 }}>
		<div class="w-full lg:w-8/12">
			<ErrorCard {errorsHandler} />
			{#if step == 1}
				<div in:fly|local={{ x: 300, duration: 300 }}>
					<FacturationForm bind:user bind:invalid={facturationFormInvalid} {errorsHandler} />
				</div>
			{:else if step == 2}
				<div in:fly|local={{ x: 300, duration: 300 }}>
					<SummaryForm bind:user bind:step {isSavingLegals} {errorsHandler} />
				</div>
			{/if}
		</div>
		<div class="w-full lg:w-4/12">
			<div
				class="py-2 lg:mb-6 pb-5 px-5 lg:px-6 xl:pl-12 lg:block w-full border-t border-gray-400 lg:border-none lg:mt-0 follow-screen"
				style="height: fit-content;"
			>
				<CreditCard on:submit={handleSubmit} {isPaying} {cardError} showCard={step == 2}>
					<div>
						<div class="flex justify-between w-full pb-2">
							<div class="text-left">
								<p>Panier</p>
								<p class="text-sm text-gray-600">
									{$cart.productsCount} articles
									{#if $cart.returnablesCount >= 1}
										dont {$cart.returnablesCount} consigné{$cart.returnablesCount > 1 ? "s" : ""}
									{/if}
								</p>
							</div>
							<div class="text-right">
								<p class="font-medium">{formatMoney($cart.totalOnSalePrice)}</p>
								{#if $cart.returnablesCount >= 1}
									<p class="text-blue-500 font-medium text-sm">
										dont
										<img src="./img/returnable.svg" alt="consigne" style="width: 15px; display: inline;" />
										{formatMoney($cart.totalReturnableOnSalePrice)}
									</p>
								{/if}
							</div>
						</div>
						<div class="flex justify-between w-full pb-2">
							<div class="text-left">
								<p>Frais bancaires</p>
								<p class="leading-none text-gray-600 text-sm">
									<button class="btn-link" on:click={showTransactionInfo}>C'est quoi ?</button>
								</p>
							</div>
							<div>
								<p class="font-medium">{formatMoney($cart.totalFees)}</p>
							</div>
						</div>
						{#if $cart.donation > 0}
							<div class="flex justify-between w-full pb-2">
								<div class="text-left">
									<p>Don</p>
								</div>
								<div>
									<p class="font-medium">{formatMoney($cart.donation)}</p>
								</div>
							</div>
						{/if}
						<div class="flex justify-between w-full border-b border-gray-400 pb-2 text-lg">
							<div class="text-left">
								<p class="uppercase font-semibold">Total</p>
							</div>
							<div>
								<p class="font-bold text-lg">{formatMoney($cart.totalPrice)}</p>
							</div>
						</div>
						<div class="mt-3">
							{#if step == 2}
								<!-- <button
									type="button"
									on:click={handleSubmit}
									class="btn btn-primary btn-lg uppercase w-full lg:w-8/12
										justify-center m-auto"
									class:disabled={isPaying || invalidPaymentForm}
									disabled={isPaying || invalidPaymentForm}
									style="padding-left: 50px; padding-right: 50px;">
									{#if isPaying}
										<Icon data={faCircleNotch} spin />
									{:else}Commander{/if}
								</button> -->
							{:else if step !== 2}
								<button
									type="button"
									on:click={handleSubmitLegals}
									class:disabled={isSavingLegals || facturationFormInvalid}
									class="btn btn-accent btn-lg uppercase w-full lg:w-8/12
										justify-center m-auto"
									style="padding-left: 50px; padding-right: 50px;"
								>
									Suivant {#if isSavingLegals}
										<Icon data={faCircleNotch} spin class="ml-2" />
									{/if}
								</button>
							{/if}
						</div>
					</div>
				</CreditCard>
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.follow-screen {
		@media (min-width: 1024px) {
			position: fixed;
			width: inherit;
		}
	}

</style>
