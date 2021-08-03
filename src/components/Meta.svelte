<script>
	export let metadata = {};

	if (metadata.title == null) metadata.title = "Sheaft - Consommer local, plus facilement";

	if (metadata.description == null)
		metadata.description =
			"Découvrez et commandez en quelques clics des produits de qualité issus de la production locale.";

	if (metadata.image == null) metadata.image = "/assets/android-chrome-96x96.png";

	if (metadata.imageAlt == null) metadata.imageAlt = "Sheaft";

	if (metadata.url == null) metadata.url = "https://app.sheaft.com";
</script>

<svelte:head>
	{#if metadata.title}
		<title>{metadata.title}</title>
		<meta name="title" content={metadata.title} />
		<meta property="og:title" content={metadata.title} />
		<meta property="twitter:title" content={metadata.title} />
		<meta itemprop="name" content={metadata.title} />
	{/if}

	{#if metadata.description}
		<meta name="description" content={metadata.description} />
		<meta property="og:description" content={metadata.description} />
		<meta property="twitter:description" content={metadata.description} />
		<meta itemprop="description" content={metadata.description} />
	{/if}

	{#if metadata.image}
		<meta property="og:image" content={metadata.image} />
		<meta property="twitter:image" content={metadata.image} />
		<meta itemprop="image" content={metadata.image} />
	{/if}

	{#if metadata.imageAlt}
		<meta property="og:image:alt" content={metadata.imageAlt} />
		<meta property="twitter:image:alt" content={metadata.imageAlt} />
	{/if}

	{#if metadata.url}
		<meta property="og:url" content={metadata.url} />
		<meta property="twitter:url" content={metadata.url} />
	{/if}

	{#if metadata.type}
		<meta property="og:type" content={metadata.type} />
	{/if}

	<meta property="twitter:card" content={metadata.twitterCard || "summary_large_image"} />
</svelte:head>
