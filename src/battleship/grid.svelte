<!--  THE GRID IS ORDERED BY COLUMNS THEN BY ROWS!  -->
<!-- TODO, make the width of tiles and the whole grid be editable (by css variables that are changed?) -->
<script>
	import { onMount } from 'svelte';
	
	import Tile from "./tile.svelte";
	
	// control variables
	export let rows;
	export let cols; // TODO, make this dynamic eventually
	export let reshape = false;
	export let resize = false;
	
	// Interaction variables (TODO create more)
	export let current_selected = null; // Row, column of current selected
	
	let selected_state = []; // selected_state is referenced [col][row] TODO change to is_selected
	
	function click_tile(row, col){
		// Change selected_state and current_selected
		if (selected_state[col][row]){
			current_selected = null;
			selected_state[col][row] = false;
		}else{
			selected_state[col][row] = true;
			if (current_selected !== null){
				selected_state[current_selected[1]][current_selected[0]] = false;
			}
			current_selected = [row,col];
		}
	}
	
	onMount( () => {
		selected_state = Array.from(Array(cols), () => Array(rows).fill(false));
	});
</script>

<div class = options_wrapper>
	{#if reshape}
		<div class="reshape">
			<span>Rows</span>
			<input type="number" min="0" onkeypress="return (event.charCode !=8 && event.charCode ==0 || (event.charCode >= 48 && event.charCode <= 57))">
			<span>Cols</span>
			<input type="number" min="0" onkeypress="return (event.charCode !=8 && event.charCode ==0 || (event.charCode >= 48 && event.charCode <= 57))">
		</div>
	{/if}
	
	{#if resize}
		<div class="resize">
			<span>Size</span>
			<input type="range"><!-- TODO set min and max-->
		</div>
	{/if}
</div>

<div class = "grid_wrapper">
	{#each Array(selected_state.length) as _, col}
		<ul class = "columns">
			{#each Array(selected_state[col].length) as _, row}
				<Tile click_handler={() =>{click_tile(row, col)}} is_selected={selected_state[col][row]}/>
			{/each}
		</ul>
	{/each}
	<div class = "TODO">Logo</div>
	<!-- TODO. Why is the bottom being cut off without this useless div	 -->
</div>
<!-- Should I use Array({lendth}) instead of length: {length}? What's the speed difference. TODO -->

<style>
    :root{
        --grid_background: #3f3a3a;
    }

		.options_wrapper, .reshape, .resize{
			display: flex;
		}
	
		.reshape, .resize{
			flex: 1 1;
			align-items: center;
			/*background: var(--grid_background);*/ /*TODO same colors? Also, background vs background-color*/
		}

    .grid_wrapper{
        /* margin-left:20%;*/
        margin-top:0.3em;
        display:block;

        background: var(--grid_background); /*TODO make this match battleship background*/
        /*animation:bgfade 5s;
        -webkit-animation:bgfade 5s;*/ /* Safari and Chrome */
    }

    ul{
        list-style:none;
        display:inline-block;

        width:2em;
        height:2em;
        margin:5px;
    }/*TODO, this whole thing needs to be redone. Commenting out this block makes it row by column (which is preferable), also spacing and what not*/
	
	.columns{
	/* TODO make column style */
	}
	
	input[type="number"] {
		width: 60px;
	}
</style>
<!-- https://www.w3docs.com/snippets/html/how-to-allow-only-positive-numbers-in-the-input-number-type.html -->