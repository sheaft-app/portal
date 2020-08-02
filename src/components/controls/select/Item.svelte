<script>
  export let isActive = false;
  export let isFirst = false;
  export let isHover = false;
  export let getOptionLabel = undefined;
  export let item = undefined;
  export let filterText = "";

  let itemClasses = "";

  $: {
    const classes = [];
    if (isActive) {
      classes.push("ssp-active");
    }
    if (isFirst) {
      classes.push("ssp-first");
    }
    if (isHover) {
      classes.push("ssp-hover");
    }
    if (item.isGroupHeader) {
      classes.push("ssp-groupHeader");
    }
    if (item.isGroupItem) {
      classes.push("ssp-groupItem");
    }
    itemClasses = classes.join(" ");
  }
</script>

<div class="ssp-item {itemClasses}">
  {@html getOptionLabel(item, filterText)}
</div>

<style>
  .ssp-item {
    cursor: default;
    height: var(--height, 42px);
    line-height: var(--height, 42px);
    padding: var(--itemPadding, 0 20px);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .ssp-groupHeader {
    text-transform: var(--groupTitleTextTransform, uppercase);
  }

  .ssp-groupItem {
    padding-left: 40px;
  }

  .ssp-item:active {
    background: var(--itemActiveBackground, #b9daff);
  }

  .ssp-item.ssp-active {
    background: var(--itemIsActiveBG, #007aff);
    color: var(--itemIsActiveColor, #fff);
  }

  .ssp-item.ssp-first {
    border-radius: var(--itemFirstBorderRadius, 4px 4px 0 0);
  }

  .ssp-item.ssp-hover:not(.ssp-active) {
    background: var(--itemHoverBG, #e7f2ff);
  }
</style>
