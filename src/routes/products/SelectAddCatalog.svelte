<script>
    import { GET_CATALOGS } from "./../catalogs/queries";
    import Select from "./../../components/controls/select/Select";
    import SheaftErrors from "../../services/SheaftErrors";
    import { onMount, getContext } from "svelte";
    import { faPlus } from "@fortawesome/free-solid-svg-icons";
    import SelectAddCatalogItem from "./SelectAddCatalogItem.svelte";
    
    export let catalogs;

    const errorsHandler = new SheaftErrors();
    const { query, isLoading } = getContext('api');

    let allCatalogs = [];
    let displayedCatalogs = [];
    let handleClear;

    onMount(async () => {
        await query({
            query: GET_CATALOGS,
            variables: { first: 50 },
            errorsHandler,
            success: (res) => allCatalogs = res.filter((c) => !catalogs.map((c1) => c1.id).includes(c.id)),
            errorNotification: "Un problème est survenu pendant la récupération des catalogues."
        });
    })

    const addCatalog = (catalog) => {
        catalogs = [
            ...catalogs,
            {
                id: catalog.id,
                name: catalog.name,
                wholeSalePricePerUnit: 0,
                addedOn: Date.now(),
                checked: true
            }
        ];

        handleClear();
    }

    $: displayedCatalogs = allCatalogs.filter((c) => !catalogs.map((c1) => c1.id).includes(c.id));
</script>


{#if !$isLoading}
    <div class="themed w-full">
        <Select
        items={displayedCatalogs}
        icon={faPlus}
        iconClasses="mr-3 text-accent"
        getOptionLabel={(l) => l.name}
        Item={SelectAddCatalogItem}
        bind:handleClear
        getSelectionLabel={(l) => l.name}
        showChevron={true}
        hideSelectedOnFocus={true}
        on:select={(v) => addCatalog(v.detail)}
        optionIdentifier="id"
        placeholder="Ajouter à un autre catalogue"
        noOptionsMessage="Aucun catalogue trouvé"
        isSearchable={true}
        isClearable={false}
        containerStyles="font-weight: 600; color: #4a5568;" />
    </div>
{/if}

 <style lang="scss">
     .themed {
        display: contents;
        --cursor: text;
        --padding: 0 15px;
        --borderFocusColor: #a0aec0;
        --borderHoverColor: #a0aec0;
        --border: 1px solid #cbd5e0;
        --placeholderColor: #ff4081;
        --inputPadding: 35px;
        --inputColor: #205164;
        --indicatorTop: 9px;
        --indicatorColor: #ff4081;
    }
 </style>
