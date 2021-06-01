<script>
	export let getSelectionLabel = undefined;
	export let item = undefined;

</script>

<div class="ssp-selection">
	{@html getSelectionLabel(item)}
</div>

<style>
	.ssp-selection {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}

</style>
