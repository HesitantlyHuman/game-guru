<script>
    export let rows;
    export let cols;
    export let reshape = false;
	export let resize = false;
</script>

<div class = options_wrapper>
	{#if reshape}
		<div class="reshape">
			<span>Rows</span>
			<input bind:value={rows} type="number" min="1" onkeypress="return (event.charCode !=8 && event.charCode ==0 || (event.charCode >= 48 && event.charCode <= 57))">
			<span>Cols</span>
			<input bind:value={cols} type="number" min="1" onkeypress="return (event.charCode !=8 && event.charCode ==0 || (event.charCode >= 48 && event.charCode <= 57))">
		</div>
	{/if}
	
	{#if resize}
		<div class="resize">
			<span>Size</span>
			<input type="range"><!-- TODO set min and max-->
		</div>
	{/if}
</div>