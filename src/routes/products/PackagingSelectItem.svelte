<script>
    export let item = undefined;
    export const getOptionLabel = undefined;
</script>

<div class="cursor-pointer py-2 px-1 border-b border-gray-300 border-solid hover:bg-gray-200 pl-3">
    <p class="font-semibold">{item.name}</p>
    <p class="text-sm font-normal">{item.wholeSalePrice}€ (HT)</p>
</div>