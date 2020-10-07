<script>
  import { setContext as baseSetContext } from "svelte";
  import { freezeBody, unfreezeBody } from "./../../helpers/app";
  import { fly } from "svelte/transition";

  export let key = "modal";
  export let setContext = baseSetContext;

  let Component = null;
  let props = null;
  let introEnded = false;

  var popStateListener = (event) => {
    if (Component) {
      return close();
    }
  }
  
  const open = (NewComponent, newProps = {}) => {
    window.addEventListener("popstate", popStateListener, false);
    history.pushState({ Component }, "Modal");
    Component = NewComponent;
    props = newProps;

    freezeBody();
  };

  const close = () => {
    window.removeEventListener("popstate", popStateListener, false);
    Component = null;
    props = null;

    unfreezeBody();
  };

  const handleKeyup = ({ key }) => {
    if (Component && key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  const handleOuterClick = event => {
    if (state.closeOnOuterClick && (event.target === background || event.target === wrap)) {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  };

  setContext(key, { open, close });
</script>

<svelte:window on:keyup={handleKeyup} />

<div style="height: inherit;">
  {#if Component}
    <div class="modal-background" style="z-index: 8" on:click={(event) => { event.preventDefault(); event.stopPropagation(); close();}}/>
    <form class="absolute w-full h-full flex items-center justify-center">
      <div
        role="dialog"
        in:fly={{ y: 300, duration: 400 }}
        on:introend="{() => introEnded = true}"
        aria-modal="true"
        style={props.style}
        class:visibleNav={props.visibleNav}
        class="modal bg-white p-6 pt-2 z-10 w-full lg:w-auto h-full lg:h-auto lg:rounded-lg shadow-xl overflow-y-scroll lg:overflow-visible overflow-x-hidden">
        <div class="relative">
          <svelte:component this={Component} {...props} {close} {introEnded} />
        </div>
      </div>
    </form>
  {/if}
  <slot />
</div>

<style lang="scss">
  .modal-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
  }

  .modal {
    background: white;
    overflow-y: scroll;
    margin-top:-64px;
    max-height: calc(100vh - 200px);
    transition: all .2s ease-in-out;

    @media (min-width: 1024px) {
      margin-left: -200px;
    }
  }

  @media(min-width: 769px) {
    .modal {
      min-width: 400px;
    }
  }

  @media (max-width: 1023px) {
    .visibleNav {
      margin-top: 45px;
    }
    .modal {
      margin-top:0;
      margin-left:0;
      max-height: 100%;
    }
  }
</style>
