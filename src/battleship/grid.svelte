<script>
	import { onMount } from 'svelte';
	import { onDestroy } from 'svelte';
	
	import Tile from "./grid_tile.svelte";
	
	export let rows;
	export let cols;

	// Keep track of selecting grid elements
	export let current_selected = null; // [Row, Col] of currently selected cell
	let is_selected = []; // 2D array representing if every cell is selected or not

	function click_tile(row, col){
		if (is_selected[row][col]){ // If deselecting a tile
			current_selected = null;
			is_selected[row][col] = false;
		}else{
			is_selected[row][col] = true;
			if (current_selected !== null){ // Deselect another selected tile
				is_selected[current_selected[0]][current_selected[1]] = false; //TODO do some enumeration to explicitly say that [0] and [1] refer to the row and column value respectively
			}
			current_selected = [row,col];
		}
	}
	
	onMount(() => {
		is_selected = Array.from(Array(rows), () => Array(cols).fill(false));
	});

	onDestroy(() => {
		current_selected = null;
	});
</script>

<div class = "grid_wrapper">
	{#each is_selected as _, row}
		<ul class = "row">
			{#each is_selected[row] as _, col}
				<Tile on_click={() =>{click_tile(row, col)}} is_selected={is_selected[row][col]}/>
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