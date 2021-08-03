<script>
	import { form, bindClass } from "../../../vendors/svelte-forms/src/index";
	import { card } from "../../stores/cart";

	export let invalidPaymentForm = false;

	let paymentForm = form(
		() => ({
			number: { value: $card.data.cardNumber, validators: ["required"], enabled: true },
			month: { value: $card.month, validators: ["required"], enabled: true },
			year: { value: $card.year, validators: ["required"], enabled: true },
			cvx: { value: $card.data.cardCvx, validators: ["required"], enabled: true },
			name: { value: $card.data.cardName, validators: ["required"], enabled: true },
		}),
		{
			initCheck: false,
		}
	);

	$: invalidPaymentForm = !$paymentForm.valid;
</script>

<div class="bg-white shadow px-5 py-3 lg:rounded lg:mt-5">
	<div
		class="-my-3 -mx-5 px-5 py-3 mb-4 bg-gray-100 border-b border-gray-400 lg:rounded-t font-semibold flex justify-between items-center"
	>
		<p>Paiement</p>
	</div>
	<div class="w-full form-control">
		<label>Nom du porteur de la carte</label>
		<input
			type="text"
			class="w-full"
			placeholder="Jean Dupond"
			bind:value={$card.data.cardName}
			autocomplete="cc-name"
			name="ccname"
		/>
	</div>
	<div class="w-full form-control">
		<label>Numéro de la carte</label>
		<input
			bind:value={$card.data.cardNumber}
			type="text"
			class="w-full"
			name="cardnumber"
			autocomplete="cc-number"
			placeholder="**** **** **** ****"
		/>
	</div>
	<div class="w-full form-control">
		<div class="grid grid-cols-3 gap-2 pt-2 mb-3">
			<div class="col-span-2 ">
				<label>Date d'expiration</label>
				<div class="grid grid-cols-2 gap-2">
					<input
						bind:value={$card.month}
						type="number"
						class="w-full h-6 py-4"
						placeholder="mm"
						min="1"
						name="CCExpiryMonth"
						id="CCExpiryMonth"
						max="12"
						autocomplete="cc-exp"
					/>
					<input
						bind:value={$card.year}
						type="number"
						autocomplete="cc-exp"
						class="w-full h-6 py-4"
						name="CCExpiryYear"
						id="CCExpiryYear"
						placeholder="aaaa"
						min={new Date().getUTCFullYear()}
						max={new Date().getUTCFullYear() + 5}
					/>
				</div>
			</div>
			<div>
				<label>CVV</label>
				<input
					bind:value={$card.data.cardCvx}
					type="number"
					class="w-full h-6 py-4"
					name="cvc"
					placeholder="XXX"
					autocomplete="cc-csc"
					min="0"
					max="999"
				/>
			</div>
		</div>
	</div>
</div>
