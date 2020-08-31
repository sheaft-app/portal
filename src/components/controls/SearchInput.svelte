<script>
  import { onMount } from "svelte";
  import Icon from "svelte-awesome";
  import GetRouterInstance from "../../services/SheaftRouter.js";
  import debounce from "lodash/debounce";
  import { faTimes, faSearch } from "@fortawesome/free-solid-svg-icons";

  const routerInstance = GetRouterInstance();
  export let containerClasses = "";
  export let placeholder = "Rechercher un produit...";
  let searchQuery = "";

  onMount(() => {
    setInitialText();
  });

  function setInitialText(res) {
    let values = routerInstance.getQueryParams();
    if (values["text"]) {
      searchQuery = values["text"];
    }
  }

  const resetSearchQuery = () => {
    searchQuery = "";
    routerInstance.replaceQueryParams({ text: searchQuery });
  };

  const handleInput = debounce(e => {
    routerInstance.replaceQueryParams({ text: searchQuery });
  }, 500);
</script>

<div class="sticky shadow-md rounded {containerClasses}">
  <div
    class="absolute inset-y-0 pl-3 flex items-center pointer-events-none"
    style="left: 4px;">
    <span class="text-gray-600 sm:text-sm sm:leading-5">
      <Icon data={faSearch} />
    </span>
  </div>
  <label class="hidden" for="search-products" />
  <input
    type="text"
    {placeholder}
    class="appearance-none border-none block w-full py-3 px-10 truncate leading-tight focus:outline-none rounded font-medium"
    style="padding-left: 40px; height: 48px;"
    name="search-products"
    on:input={handleInput}
    bind:value={searchQuery} />
  <div class="absolute inset-y-0 pl-3 flex items-center" style="right: 15px;">
    <button
      aria-label="Effacer les termes de recherche"
      class:hidden={searchQuery.length <= 0}
      class="text-gray-600 sm:text-sm sm:leading-5"
      on:click={resetSearchQuery}>
      <Icon data={faTimes} />
    </button>
  </div>
</div>
