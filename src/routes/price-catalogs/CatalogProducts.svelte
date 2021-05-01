<script>
    import { GET_CATALOG_PRODUCTS } from "./queries";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
    import { getContext, onMount } from "svelte";
    import GetGraphQLInstance from "../../services/SheaftGraphQL";
    import AddProductModal from "./AddProductModal.svelte";
    import Icon from "svelte-awesome";
    import { faPlus } from "@fortawesome/free-solid-svg-icons";
    import { products } from "./stores";

    export let catalogId, errorsHandler, invalidCatalogProducts = false;
    
    const graphQLInstance = GetGraphQLInstance();
    const { open } = getContext('modal');

    let headers = [{ label: 'Nom', mobile: true }, {label: 'Prix HT', mobile: true}, {label:'Ajouté le', mobile: false}, {label: 'Actions', mobile:false}]

    onMount(async () => {
        $products = [];

        if (!catalogId) return;

        const result = await graphQLInstance.query(GET_CATALOG_PRODUCTS, {
            id: catalogId
        }, errorsHandler.Uuid);

        if (!result.data || !result.success) {
            return false;
        }

        $products = result.data;
    })

    const removeProduct = product => {
        if (product.checked) 
            $products = $products.filter((p) => p.id != product.id);
        else
            product.markForDeletion = true;

        $products = $products;
    }

    const cancelRemoveProduct = product => {
        product.markForDeletion = false;
        $products = $products;
    }

    const addProduct = () => {
        open(AddProductModal, {
            alreadyPresentProducts: $products.map((p) => p.id)
        })
    }

    $: invalidCatalogProducts = $products.length > 0 && $products.filter((p) => !p.wholeSalePricePerUnit).length > 0;
</script>

<table class="shadow">
    <thead>
        <tr class="bg-white">
            {#each headers as header}
                <th
                    class:hidden={!header.mobile}
                    class="px-3 md:px-6 py-3 border-b border-gray-300 text-left lg:table-cell
                    text-xs leading-4 font-medium text-gray-600 uppercase
                    tracking-wider">
                    {header.label}
                </th>
            {/each}
        </tr>
    </thead>
    <tbody>
        {#each $products as product}
            <tr class:bg-green-200={product.checked} class:bg-red-200={product.markForDeletion}>
                <td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                    <div
                        class="text-sm leading-5 font-medium truncate"
                        style="max-width: 180px;">
                        {product.name}
                        <p class="text-gray-600">#{product.reference}</p>
                        {#if !product.markForDeletion}
                            <button type="button" class="btn-link block lg:hidden" on:click={() => removeProduct(product)}>Retirer</button>
                        {:else}
                            <button type="button" class="btn-link block lg:hidden" on:click={() => cancelRemoveProduct(product)}>Annuler</button>
                        {/if}
                    </div>
                </td>
                <td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                    <div
                        class="text-sm leading-5 font-medium truncate"
                        style="max-width: 100px;">
                        <input
							bind:value={product.wholeSalePricePerUnit}
                            id="grid-price"
                            required
							type="number"
							step=".01"
							name="wholeSalePricePerUnit"
							placeholder="ex : 2.49"/>
                    </div>
                </td>
                <td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200 hidden lg:table-cell">
                    <div
                        class="text-sm leading-5 font-medium truncate"
                        style="max-width: 180px;">
                        {format(new Date(product.addedTo), 'PP', { locale: fr })}
                    </div>
                </td>
                <td class="px-3 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200 hidden lg:table-cell">
                    <div
                        class="text-sm leading-5 font-medium truncate"
                        style="max-width: 180px;">
                        {#if !product.markForDeletion}
                            <button type="button" class="btn btn-outline btn-lg" on:click={() => removeProduct(product)}>Retirer</button>
                        {:else}
                            <button type="button" class="btn btn-outline btn-lg" on:click={() => cancelRemoveProduct(product)}>Annuler</button>
                        {/if}
                    </div>
                </td>
            </tr>
        {/each}
        <tr class="bg-white" colspan="100">
            <td class="px-3 md:px-6 py-2 whitespace-no-wrap border-b border-gray-200">
                <button type="button" class="flex items-center btn-link" on:click={addProduct}>
                    <Icon data={faPlus} class="mr-2" />
                    Ajouter des produits
                </button>
            </td>
        </tr>
    </tbody>
</table>