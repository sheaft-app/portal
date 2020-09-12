<script>
	import { onMount, onDestroy } from "svelte";
	import CartDonation from "./CartDonation.svelte";
	import FacturationForm from "./FacturationForm.svelte";
	import PaymentInfoForm from "./PaymentInfoForm.svelte";

	let choosenDonation = null;

	let step = 1;

	onDestroy(() => {
		choosenDonation = null;
	})

</script>

{#if !choosenDonation}
	<CartDonation bind:choosenDonation />
{:else}
	<div class="flex flex-wrap justify-between">
		<div>
			{#if step == 1}
				<FacturationForm />
			{:else if step == 2}
				<PaymentInfoForm />
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
				</div>
			</div>
		</div>
	</div>
	<button
		type="button"
		on:click={() => ++step}
		class="btn btn-accent btn-lg uppercase w-full lg:w-8/12
		justify-center m-auto"
		style="padding-left: 50px; padding-right: 50px;">
		Suivant
	</button>
{/if}