<script>
    export let rows;
    export let cols;
    export let reshape = false;
	// export let resize = false;
</script>

<div class = options_wrapper>
	{#if reshape}
		<div class="reshape">
			<span>Rows</span>
			<input bind:value={rows} type="number" min="1" onkeypress="return (event.charCode !=8 && event.charCode ==0 || (event.charCode >= 48 && event.charCode <= 57))">
			<span>&nbsp;Cols</span>
			<input bind:value={cols} type="number" min="1" onkeypress="return (event.charCode !=8 && event.charCode ==0 || (event.charCode >= 48 && event.charCode <= 57))">
		</div>
	{/if}
	
	<!-- {#if resize}
		<div class="resize">
			<span>Size</span>
			<input type="range"> TODO set min and max
		</div>
	{/if} TODO only do this if the regular method of sizing is insuficient-->
</div>

<style>
	.options_wrapper, .reshape /*.resize*/{
		display: flex;
	}

	.reshape /*.resize*/{
		flex: 1 1;
		align-items: center;
		/*background: var(--grid_background);*/ /*TODO same colors? Also, background vs background-color*/
	}

	input[type="number"] {
	width: 60px;
	}
</style>