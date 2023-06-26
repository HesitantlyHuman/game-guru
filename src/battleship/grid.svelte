<!-- TODO. Grid needs to pass style guidlines to grid_tile -->
<script>
	import { onMount } from 'svelte';
	import { onDestroy } from 'svelte';
	
	import Tile from "./grid_tile.svelte";
	
	export let rows;
	export let cols;

	// State managers
	export let current_selected = null; // [Row, Col] of currently selected cell. TODO remove logic here, just return values on click and let parent handle the logic? In order to generalize it more
	let state_manager = []; // Array the size of the grid, filled with State_dict instances
	function State_dict(selected=false, ship=false, shot=false){
		this.selected = selected;
		this.ship = ship;
		this.shot = shot;
	}

	function click_tile(row, col){
		if (state_manager[row][col].selected){ // Selecting an already selected tile -> deselects it
			current_selected = null;
			state_manager[row][col].selected = false;
		}else{
			state_manager[row][col].selected = true;
			if (current_selected !== null){ // If something else is selected, it's deselected
				state_manager[current_selected[0]][current_selected[1]].selected = false; //TODO explicitly say that [0] and [1] refer to the row and column. Maybe make a dict?
			}
			current_selected = [row,col];
		}
	}
	
	onMount(() => {
		state_manager = Array.from(Array(rows), () => Array.from(Array(cols), () => new State_dict));
	});

	onDestroy(() => {
		current_selected = null;
	});
</script>

<div class = "grid_wrapper">
	{#each state_manager as _, row}
		<ul class = "row">
			{#each state_manager[row] as _, col}
				<Tile on_click={() =>{click_tile(row, col)}} state={state_manager[row][col]}/>
			{/each}
		</ul>
	{/each}
	<!-- <div class = "TODO">Logo</div> -->
	<!-- TODO. Why is the bottom being cut off without this useless div? Make it a feature with a logo?	 -->
</div>

<style>
    :root{
        --grid_background: #3f3a3a;
    }

    .grid_wrapper{
        /* margin-left:20%;*/
        /* margin-top:0.3em; */
		/* border-bottom: 1em; */
		padding-bottom: 0.1em;
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