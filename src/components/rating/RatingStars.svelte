<script>
    export let rating = null, scale = 5, color = "#009688";

    let percentage = 0;

    $: percentage = rating / scale * 100;
</script>

<div class="star-ratings-css">
  <div class="star-ratings-css-top" style="width: {percentage}%; --color: {color}">★★★★★</div>
  <div class="star-ratings-css-bottom">★★★★★</div>
</div>

<style lang="scss">
.star-ratings-css {
  unicode-bidi: bidi-override;
  color: #e4e4e4;
  position: relative;
  padding: 0;
  display: inline-flex;
  
  &-top {
    color: var(--color);
    padding: 0;
    position: absolute;
    z-index: 1;
    display: block;
    top: 0;
    left: 0;
    overflow: hidden;
  }
  
  &-bottom {
    padding: 0;
    display: block;
    z-index: 0;
  }
}
</style>