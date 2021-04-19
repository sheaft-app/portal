<script>
    /*
    Ported from https://twitter.com/imuhammederdem/status/1186335420327645184
    This software is beerware. Please buy me a beer if you find this useful: https://paypal.me/buhrmi

    TODO Geoffrey : when we'll be using his credit card with CSS, send money as thanks
    */
    
    import { onMount, createEventDispatcher } from 'svelte';
    import { form, bindClass } from '../../../vendors/svelte-forms/src/index';
    import { card } from "../../stores/cart";
    import ErrorContainer from "./../../components/ErrorContainer.svelte";
    import Icon from "svelte-awesome";
    import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

    export let isPaying = false, showCard = true;

    const dispatch = createEventDispatcher();
    
    let currentCardBackground = Math.floor(Math.random()* 25 + 1) // just for fun :D
    let cardName = ""
    let cardNumber = ""
    let cardMonth = ""
    let cardYear = ""
    let cardCvv = ""
    let minCardYear = new Date().getFullYear()
    let amexCardMask = "#### ###### #####"
    let otherCardMask = "#### #### #### ####"
    let cardType;
    let isCardFlipped = false
    let focusElementStyle = null
    let isInputFocused = false
    let refs = {}
    let cardNumberMask;
    let hasRemovedCardPreview = false;
    
    let paymentForm = form(() => ({
      number: { value: $card.data.cardNumber, validators: ['required'], enabled: true },
      month: { value: $card.month, validators: ['required'], enabled: true },
      year: { value: $card.year, validators: ['required'], enabled: true },
      cvx: { value: $card.data.cardCvx, validators: ['required', 'maxLength:3'], enabled: true },
      name: { value: $card.data.cardName, validators: ['required'], enabled: true }
    }), {
      initCheck: false
    });
    
    onMount(function() {
        document.getElementById("cardNumber").focus();
    })

    const handleSubmit = () => {
      paymentForm.validate();

      if ($paymentForm.valid)
        dispatch('submit');
    }
    
    $: cardMonth = cardMonth < minCardMonth ? '' : cardMonth
    $: minCardMonth = cardYear === minCardYear ? new Date().getMonth() + 1 : 1
    
    $: {
      // if ($card.data.cardNumber.match(new RegExp("^(34|37)")) != null) cardType = "amex";
      //   else if ($card.data.cardNumber.match(new RegExp("^5[1-5]")) != null) cardType = "mastercard";
      //   else if ($card.data.cardNumber.match(new RegExp("^6011")) != null) cardType = "discover";
      // else cardType = "visa"; // default type
    
      cardNumberMask = cardType === "amex" ? amexCardMask : otherCardMask;
    
      // Credit card input masking
      if ($card.data.cardNumber) {
        for (let index = 0; index < $card.data.cardNumber.length; index++) {
              if (cardNumberMask[index] == ' ' && $card.data.cardNumber[index] !== ' ') $card.data.cardNumber = $card.data.cardNumber.substr(0, index) + ' ' + $card.data.cardNumber.substr(index, $card.data.cardNumber.length-index)
          }
        if ($card.data.cardNumber.substr('-1') == ' ') $card.data.cardNumber = $card.data.cardNumber.substr(0, $card.data.cardNumber.length-1)
        $card.data.cardNumber = $card.data.cardNumber.substr(0, cardNumberMask.length).replace(/[^0-9 ]/g, '')
      }
    }
    
    // function focusInput(e) {
    //     isInputFocused = true;
    //   let targetRef = e.target.dataset.ref;
    //     let target = refs[targetRef];
    //     focusElementStyle = `opacity: 1;width: ${target.offsetWidth}px;height: ${target.offsetHeight}px;transform: translateX(${target.offsetLeft}px) translateY(${target.offsetTop}px)`
    // }
    
    // function blurInput() {
    //     setTimeout(() => {
    //         if (!isInputFocused) {
    //             focusElementStyle = null;
    //         }
    //     }, 300);
    //     isInputFocused = false;
    // }
</script>
    
<div class="wrapper" id="app">
  <div class="card-form">
    <!-- <div class="card-list">
      <div class="card-item" class:active={isCardFlipped}>
        <div class="card-item__side front">
          <div class="card-item__focus" class:active={focusElementStyle} style={focusElementStyle} bind:this={refs.focusElement}></div>
          <div class="card-item__cover">
            <img alt="card" src={'https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/' + currentCardBackground + '.jpeg'} class="card-item__bg">
          </div>
          <div class="card-item__wrapper">
            <div class="card-item__top">
              <img alt="card" src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/chip.png" class="card-item__chip">
              <div class="card-item__type">
                {#if cardType}
                  {#each [cardType] as cardType (cardType)}
                    <img in:fly={{y:-20}} out:fly={{y:20}} src={'https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/' + cardType + '.png'} alt="" class="card-item__typeImg">
                  {/each}
                {/if}
              </div>
            </div>
            <label for="cardNumber" class="card-item__number" bind:this={refs.cardNumber}>	
              {#each cardNumberMask as n, index (index)}
                <div class="card-item__numberItem" class:active={n.trim() === ''}>
                  {#if cardNumber.length > index}
                    <span in:fly={{y:-10}} out:fly={{y:10}}>{cardNumber[index]}</span>
                  {:else}
                    <span in:fly={{y:-10}} out:fly={{y:10}}>{n}</span>
                  {/if}
                </div>
              {/each}
            </label>
            <div class="card-item__content">
              <label for="cardName" class="card-item__info" bind:this={refs.cardName}>
                <div class="card-item__holder">Nom</div>
                  {#if cardName.length}
                    <div class="card-item__name">
                        {#each cardName.replace(/\s\s+/g, ' ') as n, index (index + 1)}
                          {#if index == index}
                            <span in:fly={{y:-6}} class="card-item__nameItem" >{n}</span>
                          {/if}
                        {/each}
                    </div>
                  {:else}
                    <div in:fly={{y:-6}} class="card-item__name placeholder">NOM PRÉNOM</div>
                  {/if}
              </label>
              <div class="card-item__date" bind:this={refs.cardDate}>
                <label for="cardMonth" class="card-item__dateTitle">Expire</label>
                <label for="cardMonth" class="card-item__dateItem">
                  {#each [cardMonth] as cardMonth (cardMonth)}
                    <span in:fly={{y:-6}} out:fly={{y:6}}>{cardMonth || 'MM'}</span>
                  {/each}
                </label>
                /
                <label for="cardYear" class="card-item__dateItem">
                  {#each [cardYear] as cardYear (cardYear)}
                    <span in:fly={{y:-6}} out:fly={{y:6}}>{cardYear ? String(cardYear).slice(2,4) : 'AA'}</span>
                  {/each}
                  
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="card-item__side back">
          <div class="card-item__cover">
            <img alt="card" src={'https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/' + currentCardBackground + '.jpeg'} class="card-item__bg">
          </div>
          <div class="card-item__band"></div>
          <div class="card-item__cvv">
              <div class="card-item__cvvTitle">CVV</div>
              <div class="card-item__cvvBand">{cardCvv}</div>
              <div class="card-item__type">
                {#if cardType}
                  {#each [cardType] as cardType (cardType)}
                    <img in:fly={{y:-20}} out:fly={{y:20}} alt="card" src={'https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/' + cardType + '.png'} class="card-item__typeImg">
                  {/each}
                {/if}
              </div>
          </div>
        </div>
      </div>
    </div> -->
    <div class="card-form__inner">
      <slot></slot>
      {#if showCard}
        <div class="card-input">
          <label for="cardNumber" class="card-input__label">Numéro de carte</label>
          <input type="text" id="cardNumber" v-mask="generateCardNumberMask" use:bindClass={{ form: paymentForm, name: "number"}} bind:value={$card.data.cardNumber} data-ref="cardNumber" autocomplete="off">
          <ErrorContainer field={$paymentForm.fields.number} />
        </div>
        <div class="card-input">
          <label for="cardName" class="card-input__label">Nom sur la carte</label>
          <input type="text" id="cardName" bind:value={$card.data.cardName} use:bindClass={{ form: paymentForm, name: "name"}} data-ref="cardName" autocomplete="off">
          <ErrorContainer field={$paymentForm.fields.name} />
        </div>
        <div class="card-form__row">
          <div class="card-form__col">
            <div class="card-form__group">
              <label for="cardMonth" class="card-input__label">Expiration</label>
              <select class="card-input__input select" id="cardMonth" bind:value={$card.month} use:bindClass={{ form: paymentForm, name: "month"}} data-ref="cardDate">
                <option value="" disabled selected>Mois</option>
                {#each Array(12) as _, n}
                  <option value={(n+1) < 10 ? '0' + (n+1) : (n+1)} disabled={(n+1) < minCardMonth}>
                      {(n+1) < 10 ? '0' + (n+1) : (n+1)}
                  </option>
                {/each}
              </select>
              <ErrorContainer field={$paymentForm.fields.month} />
              <select class="card-input__input select" id="cardYear" bind:value={$card.year} use:bindClass={{ form: paymentForm, name: "year"}} data-ref="cardDate">
                <option value="" disabled selected>Année</option>
                {#each Array(12) as _, n}
                  <option value={n + minCardYear}>
                      {n + minCardYear}
                  </option>
                {/each}
              </select>
              <ErrorContainer field={$paymentForm.fields.year} />
            </div>
          </div>
          <div class="card-form__col cvv">
            <div class="card-input">
              <label for="cardCvv" class="card-input__label">CVV</label>
              <input type="text" class="card-input__input" id="cardCvv" v-mask="'####'" maxlength="4" use:bindClass={{ form: paymentForm, name: "cvx"}} bind:value={$card.data.cardCvx} on:focus={() => isCardFlipped = true} on:blur={() => isCardFlipped = false} autocomplete="off">
            </div>
          </div>
        </div>
        <ErrorContainer field={$paymentForm.fields.cvx} />
        <button class="btn btn-lg btn-primary w-full shadow-xl justify-center text-xl mt-3" disabled={isPaying || !$paymentForm.valid} class:disabled={isPaying || !$paymentForm.valid} on:click={handleSubmit}>
          {#if isPaying}
            <Icon data={faCircleNotch} spin />
          {:else}Commander{/if}
        </button>
      {/if}
    </div>
  </div>
</div>
    
    
<style>
    @import url("https://fonts.googleapis.com/css?family=Source+Code+Pro:400,500,600,700|Source+Sans+Pro:400,600,700&display=swap");
    
    * {
      box-sizing: border-box;
    }
    *:focus {
      outline: none;
    }
    
    .wrapper {
      display: flex;
    }
    @media screen and (max-width: 700px), (max-height: 500px) {
      .wrapper {
        flex-wrap: wrap;
        flex-direction: column;
      }
    }
    
    .card-form {
      max-width: 570px;
      margin: auto;
      width: 100%;
    }
    @media screen and (max-width: 576px) {
      .card-form {
        margin: 0 auto;
      }
    }
    .card-form__inner {
      background: #fff;
      box-shadow: 0 30px 60px 0 rgba(90, 116, 148, 0.4);
      border-radius: 10px;
      padding: 25px;
      /* padding-top: 154px; */
    }
    @media screen and (max-width: 480px) {
      .card-form__inner {
        padding: 25px;
        /* padding-top: 165px; */
      }
    }
    @media screen and (max-width: 360px) {
      .card-form__inner {
        padding: 15px;
        /* padding-top: 165px; */
      }
    }
    .card-form__row {
      display: flex;
      align-items: flex-start;
    }
    @media screen and (max-width: 480px) {
      .card-form__row {
        flex-wrap: wrap;
      }
    }
    .card-form__col {
      flex: auto;
      margin-right: 35px;
    }
    .card-form__col:last-child {
      margin-right: 0;
    }
    @media screen and (max-width: 480px) {
      .card-form__col {
        margin-right: 0;
        flex: unset;
        width: 100%;
        margin-bottom: 20px;
      }
      .card-form__col:last-child {
        margin-bottom: 0;
      }
    }
    .card-form__col.cvv {
      max-width: 70px;
    }
    @media screen and (max-width: 480px) {
      .card-form__col.cvv {
        max-width: initial;
      }
    }
    .card-form__group {
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
    }
    .card-form__group .card-input__input {
      flex: 1;
      margin-right: 15px;
    }
    .card-form__group .card-input__input:last-child {
      margin-right: 0;
    }
    .card-form__button {
      width: 100%;
      height: 55px;
      background: #2364d2;
      border: none;
      border-radius: 5px;
      font-size: 22px;
      font-weight: 500;
      font-family: "Source Sans Pro", sans-serif;
      box-shadow: 3px 10px 20px 0px rgba(35, 100, 210, 0.3);
      color: #fff;
      margin-top: 20px;
      cursor: pointer;
    }
    @media screen and (max-width: 480px) {
      .card-form__button {
        margin-top: 10px;
      }
    }
    
    .card-item {
      max-width: 310px;
      height: 150px;
      margin-left: auto;
      margin-right: auto;
      position: relative;
      z-index: 2;
      width: 100%;
    }
    @media screen and (max-width: 480px) {
      .card-item {
        max-width: 310px;
        height: 220px;
        width: 90%;
      }
    }
    @media screen and (max-width: 360px) {
      .card-item {
        height: 180px;
      }
    }
    .card-item.active .card-item__side.front {
      transform: perspective(1000px) rotateY(180deg) rotateX(0deg) rotateZ(0deg);
    }
    .card-item.active .card-item__side.back {
      transform: perspective(1000px) rotateY(0) rotateX(0deg) rotateZ(0deg);
    }
    .card-item__focus {
      position: absolute;
      z-index: 3;
      border-radius: 5px;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      transition: all 0.35s cubic-bezier(0.71, 0.03, 0.56, 0.85);
      opacity: 0;
      pointer-events: none;
      overflow: hidden;
      border: 2px solid rgba(255, 255, 255, 0.65);
    }
    .card-item__focus:after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      background: #08142f;
      height: 100%;
      border-radius: 5px;
      filter: blur(25px);
      opacity: 0.5;
    }
    .card-item__focus.active {
      opacity: 1;
    }
    .card-item__side {
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 00px 20px 0 rgba(14, 42, 90, 0.55);
      transform: perspective(2000px) rotateY(0deg) rotateX(0deg) rotate(0deg);
      transform-style: preserve-3d;
      transition: all 0.8s cubic-bezier(0.71, 0.03, 0.56, 0.85);
      backface-visibility: hidden;
      height: 100%;
    }
    .card-item__side.back {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      transform: perspective(2000px) rotateY(-180deg) rotateX(0deg) rotate(0deg);
      z-index: 2;
      padding: 0;
      height: 100%;
    }
    .card-item__side.back .card-item__cover {
      transform: rotateY(-180deg);
    }
    .card-item__bg {
      max-width: 100%;
      display: block;
      max-height: 100%;
      height: 100%;
      width: 100%;
      object-fit: cover;
    }
    .card-item__cover {
      height: 100%;
      background-color: #1c1d27;
      position: absolute;
      height: 100%;
      background-color: #1c1d27;
      left: 0;
      top: 0;
      width: 100%;
      border-radius: 15px;
      overflow: hidden;
    }
    .card-item__cover:after {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: rgba(6, 2, 29, 0.45);
    }
    .card-item__top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
      padding: 0 10px;
    }
    @media screen and (max-width: 480px) {
      .card-item__top {
        margin-bottom: 25px;
      }
    }
    @media screen and (max-width: 360px) {
      .card-item__top {
        margin-bottom: 15px;
      }
    }
    .card-item__chip {
      width: 25px;
    }
    @media screen and (max-width: 480px) {
      .card-item__chip {
        width: 15px;
      }
    }
    .card-item__type {
      height: 20px;
      position: relative;
      display: flex;
      justify-content: flex-end;
      max-width: 100px;
      margin-left: auto;
      width: 100%;
    }
    @media screen and (max-width: 480px) {
      .card-item__type {
        height: 40px;
        max-width: 90px;
      }
    }
    @media screen and (max-width: 360px) {
      .card-item__type {
        height: 30px;
      }
    }
    .card-item__typeImg {
      position: absolute;
      max-width: 100%;
      object-fit: contain;
      max-height: 100%;
      object-position: top right;
    }
    .card-item__info {
      color: #fff;
      width: 100%;
      max-width: calc(100% - 85px);
      padding: 10px 15px;
      font-weight: 500;
      display: block;
      cursor: pointer;
    }
    @media screen and (max-width: 480px) {
      .card-item__info {
        padding: 10px;
      }
    }
    .card-item__holder {
      opacity: 0.7;
      font-size: 11px;
    }
    .card-item__wrapper {
      font-family: "Source Code Pro", monospace;
      padding: 15px 15px;
      position: relative;
      z-index: 4;
      height: 100%;
      text-shadow: 7px 6px 10px rgba(14, 42, 90, 0.8);
      userselect: none;
    }
    @media screen and (max-width: 480px) {
      .card-item__wrapper {
        padding: 20px 10px;
      }
    }
    .card-item__name {
      font-size: 15px;
      line-height: 1;
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      text-transform: uppercase;
    }
    .card-item__nameItem {
      display: inline-block;
      min-width: 8px;
      position: relative;
    }
    .card-item__number {
      font-weight: 500;
      line-height: 1;
      color: #fff;
      font-size: 20px;
      display: inline-block;
      padding: 10px 15px;
      cursor: pointer;
    }
    @media screen and (max-width: 480px) {
      .card-item__number {
        font-size: 21px;
        margin-bottom: 15px;
        padding: 10px 10px;
      }
    }
    @media screen and (max-width: 360px) {
      .card-item__number {
        font-size: 19px;
        margin-bottom: 10px;
        padding: 10px 10px;
      }
    }
    .card-item__numberItem {
      width: 6px;
      display: inline-block;
      vertical-align: top;
    }
    .card-item__numberItem span {
      position: absolute;
    }
    .card-item__numberItem.active {
      width: 30px;
    }
    @media screen and (max-width: 480px) {
      .card-item__numberItem {
        width: 13px;
      }
      .card-item__numberItem.active {
        width: 16px;
      }
    }
    @media screen and (max-width: 360px) {
      .card-item__numberItem {
        width: 12px;
      }
      .card-item__numberItem.active {
        width: 8px;
      }
    }
    .card-item__content {
      color: #fff;
      display: flex;
      align-items: flex-start;
    }
    .card-item__date {
      flex-wrap: wrap;
      font-size: 15px;
      margin-left: auto;
      padding: 10px;
      display: inline-flex;
      width: 80px;
      white-space: nowrap;
      flex-shrink: 0;
      cursor: pointer;
    }
    @media screen and (max-width: 480px) {
      .card-item__date {
        font-size: 16px;
      }
    }
    .card-item__dateItem {
      position: relative;
      width: 22px;
    }
    .card-item__dateItem span {
      position: absolute;
      display: inline-block;
    }
    .card-item__dateTitle {
      opacity: 0.7;
      font-size: 11px;
      width: 100%;
    }
    @media screen and (max-width: 480px) {
      .card-item__dateTitle {
        font-size: 12px;
        padding-bottom: 5px;
      }
    }
    .card-item__band {
      background: rgba(0, 0, 19, 0.8);
      width: 100%;
      height: 50px;
      margin-top: 30px;
      position: relative;
      z-index: 2;
    }
    @media screen and (max-width: 480px) {
      .card-item__band {
        margin-top: 20px;
      }
    }
    @media screen and (max-width: 360px) {
      .card-item__band {
        height: 40px;
        margin-top: 10px;
      }
    }
    .card-item__cvv {
      text-align: right;
      position: relative;
      z-index: 2;
      padding: 15px;
    }
    .card-item__cvv .card-item__type {
      opacity: 0.7;
    }
    @media screen and (max-width: 360px) {
      .card-item__cvv {
        padding: 10px 15px;
      }
    }
    .card-item__cvvTitle {
      padding-right: 10px;
      font-size: 15px;
      font-weight: 500;
      color: #fff;
      margin-bottom: 5px;
    }
    .card-item__cvvBand {
      height: 45px;
      background: #fff;
      margin-bottom: 30px;
      text-align: right;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 10px;
      color: #1a3b5d;
      font-size: 18px;
      border-radius: 4px;
      box-shadow: 0px 10px 20px -7px rgba(32, 56, 117, 0.35);
    }
    @media screen and (max-width: 480px) {
      .card-item__cvvBand {
        height: 40px;
        margin-bottom: 20px;
      }
    }
    @media screen and (max-width: 360px) {
      .card-item__cvvBand {
        margin-bottom: 15px;
      }
    }
    
    .card-list {
      margin-bottom: -130px;
    }
    @media screen and (max-width: 480px) {
      .card-list {
        margin-bottom: -120px;
      }
    }
    
    .card-input {
      margin-bottom: 20px;
    }
    .card-input__label {
      font-size: 14px;
      margin-bottom: 5px;
      font-weight: 500;
      color: #1a3b5d;
      width: 100%;
      display: block;
      userselect: none;
    }
    .card-input__input {
      width: 100%;
      height: 50px;
      border-radius: 5px;
      box-shadow: none;
      border: 1px solid #ced6e0;
      transition: all 0.3s ease-in-out;
      font-size: 18px;
      background: none;
      color: #1a3b5d;
      font-family: "Source Sans Pro", sans-serif;
    }
    /* .card-input__input:hover, .card-input__input:focus {
      border-color: #3d9cff;
    } */
    .card-input__input:focus {
      box-shadow: 0px 10px 20px -13px rgba(32, 56, 117, 0.35);
    }
    .card-input__input.select {
      -webkit-appearance: none;
      background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAeCAYAAABuUU38AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAUxJREFUeNrM1sEJwkAQBdCsngXPHsQO9O5FS7AAMVYgdqAd2IGCDWgFnryLFQiCZ8EGnJUNimiyM/tnk4HNEAg/8y6ZmMRVqz9eUJvRaSbvutCZ347bXVJy/ZnvTmdJ862Me+hAbZCTs6GHpyUi1tTSvPnqTpoWZPUa7W7ncT3vK4h4zVejy8QzM3WhVUO8ykI6jOxoGA4ig3BLHcNFSCGqGAkig2yqgpEiMsjSfY9LxYQg7L6r0X6wS29YJiYQYecemY+wHrXD1+bklGhpAhBDeu/JfIVGxaAQ9sb8CI+CQSJ+QmJg0Ii/EE2MBiIXooHRQhRCkBhNhBcEhLkwf05ZCG8ICCOpk0MULmvDSY2M8UawIRExLIQIEgHDRoghihgRIgiigBEjgiFATBACAgFgghEwSAAGgoBCBBgYAg5hYKAIFYgHBo6w9RRgAFfy160QuV8NAAAAAElFTkSuQmCC");
      background-size: 12px;
      background-position: 90% center;
      background-repeat: no-repeat;
      padding-right: 30px;
    }
</style>