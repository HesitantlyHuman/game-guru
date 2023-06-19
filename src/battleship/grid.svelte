<!-- TODO, make the width of tiles and the whole grid be editable (by css variables that are changed?) -->
<script>
	import { onMount } from 'svelte';
	import { onDestroy } from 'svelte';
	
	import Tile from "./grid_tile.svelte";
	
	// Control variables
	export let rows;
	export let cols;
	
	// State variables
	export let current_selected = null; // Row, column of current selected
	let selected_state = []; // selected_state is referenced [col][row] TODO change to is_selected

	function click_tile(row, col){
		if (selected_state[row][col]){ // If deselecting a tile
			current_selected = null;
			selected_state[row][col] = false;
		}else{
			selected_state[row][col] = true;
			if (current_selected !== null){ // Deselect another selected tile
				selected_state[current_selected[0]][current_selected[1]] = false; //TODO do some enumeration to explicitly say that [0] and [1] refer to the row and column value respectively
			}
			current_selected = [row,col];
		}
	}
	
	onMount(() => {
		selected_state = Array.from(Array(rows), () => Array(cols).fill(false));
	});

	onDestroy(() => {
		current_selected = null;
	});
</script>

<div class = "grid_wrapper">
	{#each selected_state as _, row}
		<ul class = "row">
			{#each selected_state[row] as _, col}
				<Tile click_handler={() =>{click_tile(row, col)}} is_selected={selected_state[row][col]}/>
			{/each}
		</ul>
	{/each}
	<div class = "TODO">Logo</div>
	<!-- TODO. Why is the bottom being cut off without this useless div	 -->
</div>

<style>
    :root{
        --grid_background: #3f3a3a;
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
        height:2em;
        margin:5px;
    }
	/*TODO, make better spacing eventually*/
	
	.row{
	/* TODO may use this, if I don't after the final pretty phase then delete it */
	}
</style>
<!-- https://www.w3docs.com/snippets/html/how-to-allow-only-positive-numbers-in-the-input-number-type.html -->

<!-- TODO, have grid accept "style types" generically that parents can pass in -->