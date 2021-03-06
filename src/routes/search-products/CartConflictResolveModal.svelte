<script>
  import cartStore from "../../stores/cart";
  import { formatMoney } from "./../../helpers/app.js";

  export let onClose, close;

  const handleSubmit = async (selectedId) => {
    cartStore.chooseCart(selectedId);
    close();
  };
</script>

<div class="pb-2">
  <div class="flex justify-between bg-primary -mx-6 px-6 py-2 -mt-2 items-center md:rounded-t-l">
    <h3 class="text-lg font-semibold text-white mb-0">
      Choisir un panier
    </h3>
  </div>
  {#each $cartStore.conflicts as conflict, index}
    <p class="bg-gray-300 -mx-6 px-6 py-2 mb-3 font-semibold">Panier {index + 1}</p>
    {#each conflict.products as product}
        <div class="py-2 justify-between px-2 flex border-b border-gray-200 border-solid">
          <div
            class="w-1/12 h-12 text-right leading-none"
            style="margin-right: 12px; max-width: 26px;">
            <span>{product.quantity}</span>
          </div>
          <div class="w-9/12">
            <p class="font-semibold mb-0 leading-none">{product.name}</p>
            <p class="text-sm">{product.producer.name}</p>
          </div>
        <div class="w-2/12 text-right">
          <p class="font-bold leading-none">
            {formatMoney(product.unitOnSalePrice * product.quantity)}
          </p>
        </div>
      </div>
    {/each}
    <button class="btn btn-accent btn-lg my-3 m-auto" on:click={() => handleSubmit(conflict.id)}>Choisir ce panier</button>
  {/each}
</div>

  