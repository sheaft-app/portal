<script>
		import { onMount, onDestroy } from "svelte";
		import CartDonation from "./CartDonation.svelte";

		let choosenDonation = null;

		onDestroy(() => {
			choosenDonation = null;
		})

</script>

{#if !choosenDonation}
	<CartDonation bind:choosenDonation />
{:else}
	<p>Okep !</p>
{/if}