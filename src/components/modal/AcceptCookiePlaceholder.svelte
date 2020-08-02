<script>
  import { onMount, onDestroy, getContext } from "svelte";
  import AcceptCookies from "./AcceptCookies.svelte";
  import GetAnalyticsInstance from "./../../services/SheaftAnalytics.js";

  let { open } = getContext("modal");
  const analyticsInstance = GetAnalyticsInstance();

  function openAcceptCookies() {
    open(AcceptCookies, {
      onClose: res => {
        analyticsInstance.insights.config.isCookieUseDisabled = !res;
        analyticsInstance.insights.config.isStorageUseDisabled = !res;
        analyticsInstance.insights.config.enableSessionStorageBuffer = res;
        localStorage.setItem("user_cookies_consent", JSON.stringify(res));
      }
    });
  }

  onMount(() => {
    var cookieConsent = JSON.parse(
      localStorage.getItem("user_cookies_consent")
    );

    if (cookieConsent == null) {
      openAcceptCookies();
      return;
    }

    analyticsInstance.insights.config.isCookieUseDisabled = !cookieConsent;
  });
</script>
