<script>
  import { onMount, getContext } from "svelte";
  import { fly } from "svelte/transition";
  import Icon from "svelte-awesome";
  import { faPaperPlane, faCircleNotch, faImage } from "@fortawesome/free-solid-svg-icons";
  import CategorySelect from "./../../components/controls/CategorySelect.svelte";
  import Toggle from "./../../components/controls/Toggle.svelte";
  import Select from "./../../components/controls/select/Select.js";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import PackagingSelectItem from "./PackagingSelectItem.svelte";
  import CreatePackaging from "./../packagings/CreatePackaging.svelte";
  import TagKind from "./../../enums/TagKind.js";
  import { GET_PACKAGINGS, GET_TAGS } from "./queries.js";
  import ChangeImage from "./ChangeImage.svelte";
  
  export let submit, product, isLoading;

  const { open } = getContext("modal");
  const graphQLInstance = GetGraphQLInstance();

  let isLoadingTags = false;
  let isLoadingPackagings = false;

  let selectedCategory = null;
  let packagings = [];
  let tags = [];

  $: isValid = product &&
  product.name &&
  product.wholeSalePricePerUnit && 
  product.vat &&
  selectedCategory &&
  product.quantityPerUnit &&
  product.unit != null;

  let isBio = false;
  let bioTag = null;

  $: if (product && product.tags && product.tags && product.tags.length > 0) {
    selectedCategory = product.tags.find((i) => TagKind.get(i.kind).Value == TagKind.Category.Value);
    isBio = bioTag && product.tags.filter((i) => i.id === bioTag.id).length > 0;
  }

  const toggleBio = () => {
    if (!isBio) {
      product.tags = [...product.tags, bioTag];
    } else {
      product.tags = product.tags.filter((i) => i.id !== bioTag.id);
    }
  }

  const changeCategory = (category) => {
    if (product.tags && product.tags) {
      product.tags = [...product.tags.filter((i) => TagKind.get(i.kind).Value != TagKind.Category.Value), category.detail];
    } else {
      product.tags = [category.detail]
    }
  }

  const selectVat = (vat) => {
    return product.vat = vat;
  }

  onMount(async () => {
    isLoading = true;
    await getTags();
    await getPackagings();
    isLoading = false;
  })

  const getPackagings = async () => {
    isLoadingPackagings = true;
    var res = await graphQLInstance.query(GET_PACKAGINGS);
    isLoadingPackagings = false;

    if(!res.success){
        //TODO
        return;
    }

    packagings = res.data;
  }

  const getTags = async () => {
    isLoadingTags = true;
    var res = await graphQLInstance.query(GET_TAGS);
    isLoadingTags = false;

    if(!res.success){
        //TODO
        return;
    }

    tags = res.data;
    bioTag = tags.find(t => t.name.toLowerCase() === "bio" && TagKind.Label.Value == TagKind.get(t.kind).Value);
  }

  const showCreatePackagingModal = () => {
    open(CreatePackaging, {
      isInModal: true,
      onClose: async res => {
        if(res.success){
          packagings = [...packagings, res.data];          
          product.packaging = res.data;
        }
      }
    });
  }
  
  const changeImage = () => {
    open(ChangeImage, {
      product,
      onClose: res => {
        if(res.success){
          product.picture = res.data;
        }
      }
    });
  };

</script>

<form class="w-full" on:submit|preventDefault={submit}>
  <div class="flex flex-wrap mb-6 lg:mb-0">
    <div class="w-full lg:w-1/2">
      <div class="form-control">
        <div class="w-full">
          <label for="grid-reference">Référence</label>
          <input
            bind:value={product.reference}
            class:disabled={isLoading}
            disabled={isLoading}
            id="grid-reference"
            type="text"
            placeholder="Auto-générée si non renseignée" />
        </div>
      </div>
      <div class="form-control">
        <div class="w-full">
          <label for="grid-product">Nom du produit *</label>
          <input
            bind:value={product.name}
            class:disabled={isLoading}
            disabled={isLoading}
            required
            id="grid-product"
            type="text"
            placeholder="Tomate ancienne" />
        </div>
      </div>  
      <div class="form-control">
        <div class="w-full">
          <label for="grid-price">Prix hors taxes *</label>
          <input
            bind:value={product.wholeSalePricePerUnit}
            class:disabled={isLoading}
            disabled={isLoading}
            required
            id="grid-price"
            type="number"
            step=".01"
            placeholder="2.49" />
        </div>
      </div>
      <div class="form-control">
        <div class="w-full">
          <label for="grid-vat">TVA *</label>
          <div class="w-full text-lg justify-center button-group">
            <button
              on:click={() => selectVat(5.5)}
              type="button"
              class:selected={product.vat === 5.5}
              class:disabled={isLoading}>
              5,5%
            </button>
            <button
              on:click={() => selectVat(10)}
              type="button"
              class:selected={product.vat === 10}
              class:disabled={isLoading}>
              10%
            </button>
            <button
              on:click={() => selectVat(20)}
              type="button"
              class:selected={product.vat === 20}
              class:disabled={isLoading}>
              20%
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full lg:w-1/2 lg:pl-3">
      <div class="form-control" style="height: 300px;">
        <div class="w-full" on:click={() => changeImage()}>
          <label for="grid-image">Image</label>
          <div class="border border-gray-300 cursor-pointer text-center h-full">
            {#if product.picture}
              <div
                class="h-full"
                style="background: url('{product.picture}'); background-size: cover;
                background-position: center;
                margin:auto;" />
            {:else}
              <Icon
                data={faImage}
                class="mr-2 inline"
                scale={2}
                style="margin:105px;" />
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="form-control" style="display: block;">
    <label>Catégorie *</label>
    <CategorySelect disabled={isLoading} on:change={(c) => changeCategory(c)} selectedCategory={selectedCategory} displayOptionAllProducts={false} grid="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-7 gap-3" />
  </div>
  <div class="form-control">
    <div class="w-full">
     <label for="grid-unit">Conditionnement *</label>
     <div class="flex">
     <input 
        type="number"
        bind:value={product.quantityPerUnit}
        id="grid-quantityPerUnit"
        required="required"
        placeholder="250"
        class:disabled={isLoading}
        class="w-1/2 lg:w-2/12 mr-2"
        disabled={isLoading} />
      <select
        bind:value={product.unit}
        id="grid-unit"
        required="required"
        class:disabled={isLoading}
        class="w-1/2 lg:w-2/12"
        disabled={isLoading}>
        <option selected="true" disabled>unité de mesure</option>
        <option value="ML">ml</option>
        <option value="L">L</option>
        <option value="G">g</option>
        <option value="KG">kg</option>
      </select>
      </div>
    </div>
  </div>
  <div class="form-control" style="display: block;">
    <label>Labels</label>
    <Toggle disabled={isLoading} classNames="ml-1" isChecked={isBio} on:change={() => toggleBio()}>
      <span>Produit issu de l'agriculture biologique</span>
    </Toggle>
  </div>
  <div class="form-control" style="display: block;">
    <label>Type de consigne</label>
    <div class="themed">
      <Select
        items={packagings}
        getOptionLabel={(l) => l.name}
        Item={PackagingSelectItem}
        getSelectionLabel={(l) => l.name}
        showChevron={true}
        hideSelectedOnFocus={true}
        optionIdentifier="id"
        placeholder="Assignez une consigne"
        noOptionsMessage="Aucune consigne trouvée"
        bind:selectedValue={product.packaging}
        isSearchable={true}
        isClearable={false}
        containerStyles="font-weight: 600; color: #4a5568;" />
    </div>
    {#if packagings.length > 0 && product.packaging}
      <button transition:fly|local={{ y: -30 }} type="button" class="btn-link text-sm" on:click={() => product.packaging = null}>Retirer la consigne du produit</button>
    {:else}
      <button on:click={showCreatePackagingModal} transition:fly|local={{ y: -30 }} type="button" class="btn-link text-sm">Créer une nouvelle consigne</button>
    {/if}
  </div>
  <div class="form-control">
    <div class="w-full md:w-2/2">
     <label for="grid-description">Description</label>
      <textarea
        bind:value={product.description}
        id="grid-description"
        class:disabled={isLoading}
        disabled={isLoading}
        type="text"
        style="min-height:150px;"
        placeholder="Tomate ancienne d'une variété très particulière" />
    </div>
  </div>
  <div class="form-control justify-end mt-5">
    <button
      type="submit"
      class:disabled={isLoading || !isValid}
      disabled={isLoading || !isValid}
      class="btn btn-primary btn-lg justify-center w-full md:w-auto">
      <Icon
        data={isLoading ? faCircleNotch : faPaperPlane}
        class="mr-2 inline"
        spin={isLoading} />
      Valider
    </button>
  </div>
</form>

<style>
  .themed {
    display: contents;
    --cursor: text;
    --padding: 16px 18px;
    --borderFocusColor: #a0aec0;
    --borderHoverColor: #a0aec0;
    --border: 1px solid #cbd5e0;
    --placeholderColor: #8290a2;
    --inputPadding: 18px;
    --inputColor: #205164;
  }
</style>
