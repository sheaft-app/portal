<script>
	export let props;
	export let useBorder = false;
</script>

<div class="py-3 px-4 store-card border-gray-300 rounded-lg" class:border={useBorder}>
	<p class="font-semibold mb-1">{props.name}</p>
	<p class="text-gray-600">{props.address.line1}</p>
	<p class="text-gray-600">{props.address.zipcode} {props.address.city}</p>
</div>

<style>
	@media (min-width: 375px) {
		.store-card {
			min-width: 340px;
		}
	}
</style>
