<script>
  import GetRouterInstance from "../../services/SheaftRouter.js";
  import CategorySelect from "./../../components/controls/CategorySelect.svelte";
  import Toggle from "./../../components/controls/Toggle.svelte";
  import SortingSelect from "./SortingSelect.svelte";
  import Icon from "svelte-awesome";
  import { faTimes } from "@fortawesome/free-solid-svg-icons";

  const routerInstance = GetRouterInstance();
  export let close, filters;

  const toggleBio = () => {
    let values = routerInstance.getQueryParams();

    if (!values["labels"]) {
      routerInstance.replaceQueryParams({
        labels: ["bio"]
      });
      return close();
    }
     

    if (values["labels"].includes("bio")) {
      routerInstance.replaceQueryParams({
        labels: values["labels"].split(",").filter(t => t !== "bio")
      });
      return close();
    }

    routerInstance.replaceQueryParams({
      labels: [values["labels"], "bio"]
    });

    return close();
  };

  $: activeLabels = routerInstance.getQueryParams()["labels"]
    ? routerInstance.getQueryParams()["labels"]
    : [];
</script>

<div class="flex justify-between items-center pb-2">
  <p class="text-lg font-medium">Filtres</p>
  <button on:click={() => close()}>
    <Icon data={faTimes} />
  </button>
</div>
<hr />
<div class="mt-6">
  <label class="block uppercase tracking-wide text-xs font-bold mb-2">
    Tri
  </label>
  <SortingSelect {filters} callback={close} inline={true} />
</div>
<div class="mt-6">
  <label class="block uppercase tracking-wide text-xs font-bold mb-2">
    Labels
  </label>
  <Toggle
    classNames="ml-3"
    isChecked={activeLabels.includes('bio')}
    on:change={() => toggleBio()}>
     <span>Produit issu de l'agriculture biologique</span>
  </Toggle>
</div>
<div class="mt-6">
  <label class="block uppercase tracking-wide text-xs font-bold mb-2">
    Catégories
  </label>
  <CategorySelect
    callback={close}
    withSearch={true}
    grid="grid grid-cols-2 lg:grid-cols-3 gap-2" />
</div>
