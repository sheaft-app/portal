<script>
	import { onMount, onDestroy } from "svelte";
	import { fly, slide } from "svelte/transition";
  import InputCheckbox from "./../../components/controls/InputCheckbox.svelte";
	import CartDonation from "./CartDonation.svelte";
	import FacturationForm from "./FacturationForm.svelte";
	import PaymentInfoForm from "./PaymentInfoForm.svelte";
  import GetGraphQLInstance from "../../services/SheaftGraphQL";
	import SheaftErrors from "../../services/SheaftErrors";
	import { GET_MY_CONSUMER_LEGALS } from "./queries";
	import { PAY_ORDER, CREATE_CONSUMER_LEGALS } from "./mutations";
	import Loader from "../../components/Loader.svelte";

  const errorsHandler = new SheaftErrors();
	const graphQLInstance = GetGraphQLInstance();
	
	let choosenDonation = null;

	let step = 1, acceptCgv = false;

	let isLoading = true;
	let userLegalsFound = false;

	let user = {
    firstName: null,
    lastName: null,
    birthDate: null,
		nationality: "FR",
		countryOfResidence: null,
    email: null,
    address: {
      line1: null,
      line2: null,
      city: null,
      zipcode: null,
		}
  };

	onDestroy(() => {
		choosenDonation = null;
	})

	const order = JSON.parse(
		localStorage.getItem("user_current_order")
	);

	onMount(async () => {
		if (!order) {
			// commande expirée
			// todo envoyer une notification
			return;
		}

		var resLegals = await graphQLInstance.query(GET_MY_CONSUMER_LEGALS, {}, errorsHandler.Uuid);

		if (!resLegals.success) {
			userLegalsFound = false;
			isLoading = false;
			return;
		}

		user = resLegals.data;
		userLegalsFound = true;
		isLoading = false;
	})

	const handleSubmit = async () => {
		var res = await graphQLInstance.mutate(PAY_ORDER, {
			orderId,
			donation: null
		}, errorsHandler.Uuid);

		if (!res.success) {
			// todo
			return;
		}
	}

	const handleSubmitLegals = async () => {
		var res = await graphQLInstance.mutate(CREATE_CONSUMER_LEGALS, {
			...user
		}, errorsHandler.Uuid);

		if (!res.success) {
			// todo
			return;
		}

		user = res.data.owner;
		++step;
	}
</script>


{#if isLoading}
	<Loader />
{:else}
	{#if !choosenDonation}
		<div in:fly|local={{ x: 300, duration: 300 }}>
			<CartDonation bind:choosenDonation />
		</div>
	{:else}
		<div class="flex flex-wrap justify-between" in:fly|local={{ x: 300, duration: 300 }}>
			<div class="lg:w-7/12">
				{#if step == 1}
					<FacturationForm bind:user />
				{:else if step == 2}
					<PaymentInfoForm {user} />
				{/if}
			</div>
			<div class="w-full lg:w-4/12">
				<div
					class="py-2 mb-6 pb-5 px-6 lg:px-6 lg:py-8 static lg:block bg-white
					shadow w-full mt-5 lg:mt-0"
					style="height: fit-content;">
					<div>
						<div class="flex justify-between w-full lg:px-3 pb-2">
							<div class="text-left">
								<p>Consignes</p>
							</div>
							<div>
								<p class="font-medium">6€</p>
							</div>
						</div>
						<div class="flex justify-between w-full lg:px-3 border-gray-300 pt-2">
							<div class="text-left">
								<p>Sous-total</p>
								<p class="text-sm text-gray-600">
									2 articles
								</p>
							</div>
							<div>
								<p class="font-bold text-lg">25€</p>
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
									class:disabled={!acceptCgv}
									class="btn btn-primary btn-lg uppercase w-full lg:w-8/12
									justify-center m-auto"
									style="padding-left: 50px; padding-right: 50px;">
									Payer
								</button>
							{:else}
								<button
									type="button"
									on:click={handleSubmitLegals}
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
{/if}