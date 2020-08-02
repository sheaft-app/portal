<script>
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";
  import InputCheckbox from "./InputCheckbox.svelte";
  import { GET_CATEGORIES } from "../queries.js";
  import GetRouterInstance from "../../services/SheaftRouter.js";
  import GetGraphQLInstance from "../../services/SheaftGraphQL.js";

  import meat from "../icons/meat.svg";
  import vegetables from "../icons/vegetables.svg";
  import dairy from "../icons/dairy.svg";
  import drinks from "../icons/drinks.svg";
  import fish from "../icons/fish.svg";
  import grocery from "../icons/grocery.svg";
  import allProducts from "../icons/allProducts.svg";

  const routerInstance = GetRouterInstance();
  const graphQLInstance = GetGraphQLInstance();
  const dispatch = createEventDispatcher();

  export let withSearch = false,
    callback = () => {},
    displayOptionAllProducts = true,
    disabled = false,
    selectedCategory = null,
    grid = null;

  let isLoading = false;
  let categories = [];

  onMount(async () => {
    categories = await getCategories();

    if (withSearch) {
      setInitialSelectedCategory(categories);
    }
  })

  const getCategories = async () => {
    isLoading = true;
    var res = await graphQLInstance.query(GET_CATEGORIES);
    isLoading = false;

    if (!res.success) {
      // todo
      return [];
    }

    return res.data;
  }
  
  const setInitialSelectedCategory = (categories) => {
    const values = routerInstance.getQueryParams();

    if (values["category"] && values["category"].length > 0) {
      categories.map(c => {
        if (values["category"].includes(c.name.toLowerCase())) {
          selectedCategory = c;
        }
      });
    }
  }

  const handleClickCategory = category => {
    if (disabled) {
      return;
    }

    selectedCategory = category;

    if (withSearch) {
      const values = routerInstance.getQueryParams();
      
      routerInstance.replaceQueryParams({
        category: selectedCategory ? selectedCategory.name.toLowerCase() : null
      });
    }

    dispatch("change", selectedCategory);
    callback();
  };

  const renderIcon = category => {
    switch (category) {
      case "fruits et légumes":
        return vegetables;
      case "viandes":
        return meat;
      case "oeufs et produits laitiers":
        return dairy;
      case "boissons":
        return drinks;
      case "poissons":
        return fish;
      case "épicerie":
        return grocery;
      default:
        return allProducts;
    }
  };
</script>

<div class="inline-flex">
  {#if isLoading}
    <div
      class={grid ? grid : 'grid grid-cols-3 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-7 gap-3'}>
      {#each Array(6) as category}
        <div
          style="width: 115px; height: 96px;"
          class="skeletan-box shadow m-auto block px-4 py-2" />
      {/each}
    </div>
  {:else}
    <div
      class={grid ? grid : 'grid grid-cols-3 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-7 gap-3'}>
      {#if displayOptionAllProducts}
        <div
          on:click|preventDefault|stopPropagation={() => handleClickCategory(null)}
          class:bg-accent={!selectedCategory}
          class="bg-white w-full shadow cursor-pointer h-full m-auto block px-4
          py-2 text-sm leading-5 focus:bg-accent hover:bg-gray-100 focus:outline-none transition duration-200 ease-in-out"
          class:disabled
          class:text-white={!selectedCategory}>
          <div class="mb-2">
            <svelte:component
              this={allProducts}
              width="30"
              style={!selectedCategory ? 'fill: #ffffff;' : ''} />
          </div>
          <span
            class="cursor-pointer uppercase tracking-wide text-xs font-bold mb-2"
            class:text-white={!selectedCategory}>
            Tous les produits
          </span>
        </div>
      {/if}
      {#each categories as category}
        <div
          on:click|preventDefault|stopPropagation={() => handleClickCategory(category)}
          class="bg-white w-full shadow cursor-pointer h-full m-auto block px-4
          py-2 text-sm leading-5 focus:bg-accent hover:bg-gray-100 focus:outline-none transition duration-200 ease-in-out"
          class:bg-accent={selectedCategory && selectedCategory.id === category.id}
          class:disabled
          class:text-white={selectedCategory && selectedCategory.id === category.id}>
          <div class="mb-2">
            <svelte:component
              this={renderIcon(category.name.toLowerCase())}
              width="30"
              style={selectedCategory && selectedCategory.id === category.id ? 'fill: #ffffff;' : ''} />
          </div>
          <span
            class="cursor-pointer uppercase tracking-wide text-xs font-bold mb-2"
            class:text-white={selectedCategory && selectedCategory.id === category.id}>
            {category.name}
          </span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  svg .active {
    fill: #ffffff;
  }
</style>
