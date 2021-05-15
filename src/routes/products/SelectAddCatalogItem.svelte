<script>
	import CatalogKind from "../../enums/CatalogKind";
    export let item = null;
</script>

<div class="cursor-pointer py-2 px-3 border-b border-gray-400 border-solid hover:bg-gray-200 flex items-center">
    <div>
        <p class="font-semibold">{item.name}</p>
        <p class="text-sm font-normal">Affichage:{CatalogKind.label(item.kind)} ({item.productsCount} produits)</p>
    </div>
</div>
