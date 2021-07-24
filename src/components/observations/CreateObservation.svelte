<script>
    import { onMount, getContext } from "svelte";
    import Select from "../controls/select/Select.svelte";
    import { GET_PRODUCER_PRODUCTS, GET_PRODUCTS_WITH_BATCHES, GET_OBSERVATIONS, GET_STORE_PRODUCERS } from "../queries";
    import { CREATE_OBSERVATION } from "../mutations";
	import SheaftErrors from "../../services/SheaftErrors";
	import Roles from "../../enums/Roles";
	import Icon from "svelte-awesome";
	import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
    import GetAuthInstance from "../../services/SheaftAuth";
    
    export let close, producerId;

    const errorsHandler = new SheaftErrors();
	const authInstance = GetAuthInstance();
    const { query, mutate } = getContext("api");

    let batches = [];
    let selectedProducer = null;
    let isSubmitting = false;
    let products = [];
	let newObservation = {
		products: [],
		batches: [],
		comment: null
    };
    let handleClearProducts, handleClearBatches;

    const loadProducts = async () => {
        if (producerId) {
            await query({
                query: GET_PRODUCER_PRODUCTS,
                variables: { id: producerId },
                errorsHandler,
                success: (res) => products = res.products,
                error: () => close(),
                errorNotification: "Impossible de récupérer les produits."
            });
        } else {
            products = await query({
                query: GET_PRODUCTS_WITH_BATCHES,
                errorsHandler,
                error: () => close(),
                errorNotification: "Impossible de récupérer les produits."
            });
        }
    }

    const handleCreateObservation = async () => {
        isSubmitting = true;
		await mutate({
			mutation: CREATE_OBSERVATION,
			variables: { 
				batchIds: newObservation.batches ? newObservation.batches.map(b => b.id) : [],
                productIds: newObservation.products.map(p => p.id),
                visibleToAll: authInstance.isInRole([Roles.Producer.Value]),
				comment: newObservation.comment
			},
			success: () => close(),
			errorsHandler,
			successNotification: "Observation envoyée",
			errorNotification: "Impossible d'envoyer l'observation",
			clearCache: [GET_OBSERVATIONS]
        });
        isSubmitting = false;
	}
    
    onMount(async () => {
        loadProducts();
    })

    const selectProduct = (e) => {
        if (!newObservation.products) {
            batches = [];
            newObservation.products = [];

            return;
        }

        batches = newObservation.products.reduce((acc, curr) => {
            return [...acc, ...curr.batches];
        }, []).filter((value, index, array) => array.findIndex(batch => batch.id === value.id) === index);
    }

    $: isValid = newObservation.products.length > 0 && newObservation.comment;
</script>

<div class="form-control">
    <label>Produits *</label>
    <div class="themed w-full">
        <Select
            items={products}
            getOptionLabel={(l) => l.name}
            on:select={selectProduct}
            isMulti
            getSelectionLabel={(l) => l.name}
            isDisabled={isSubmitting}
            showChevron={true}
            hideSelectedOnFocus={true}
            optionIdentifier="id"
            placeholder="Sélectionnez un ou des produits"
            noOptionsMessage="Aucun produit trouvé"
            bind:selectedValue={newObservation.products}
            bind:handleClear={handleClearProducts}
            isSearchable={true}
            isClearable={false}
            containerStyles="font-weight: 600; color: #4a5568;"
        />
    </div>
</div>
<div class="form-control">
    <label>Commentaire *</label>
    <textarea
        bind:value={newObservation.comment}
        disabled={isSubmitting}
        class:skeleton-box={isSubmitting}
    />
</div>
<div class="form-control">
    <label>Lots</label>
    <div class="themed w-full">
        <Select
            items={batches}
            getOptionLabel={(l) => l.number}
            isMulti
            getSelectionLabel={(l) => l.number}
            isDisabled={isSubmitting}
            showChevron={true}
            hideSelectedOnFocus={true}
            optionIdentifier="id"
            placeholder="Sélectionnez un ou des lots"
            noOptionsMessage="Aucun lot trouvé"
            bind:selectedValue={newObservation.batches}
            bind:handleClear={handleClearBatches}
            isSearchable={true}
            isClearable={false}
            containerStyles="font-weight: 600; color: #4a5568;"
        />
    </div>
</div>
<p class="text-small">* champs requis</p>
<button on:click={handleCreateObservation} class="btn btn-primary btn-lg mt-2" class:disabled={isSubmitting || !isValid} disabled={isSubmitting || !isValid}>
    {#if isSubmitting}
        <Icon data={faCircleNotch} spin class="mr-2" />
    {/if}
    Envoyer l'observation
</button>