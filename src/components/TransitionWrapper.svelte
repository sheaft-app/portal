<script>
  import { fade } from "svelte/transition";

  export let 
    style = null,
    classNames = null,
    hasRightPanel = false;
</script>

<div
  in:fade={{ duration: 300 }}
  class:wrap-main-content={hasRightPanel}
  class="h-full {classNames ? classNames : ''} container"
  style="{style ? style : ''}">
  <slot />
</div>

<style>
  @media (min-width: 1025px) {
    .wrap-main-content {
      max-width: calc(100% - 350px);
    }
  }
</style>
