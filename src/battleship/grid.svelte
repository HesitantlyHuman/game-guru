<!--  THE GRID IS ORDERED BY COLUMNS THEN BY ROWS!  -->
<script>
	import Tile from "./tile.svelte";
	
	import { onMount } from 'svelte';

	export let rows;
	export let cols; // TODO, make this dynamic eventually
	export let current_selected = null; // Row, column of current selected
	
	let selected_state = []; // selected_state is referenced [col][row] TODO change to is_selected
	
	function click_tile(row, col)
	{
		// Change selected_state and current_selected
		if (selected_state[col][row])
		{
			current_selected = null;
			selected_state[col][row] = false;
		}
		else
		{
			selected_state[col][row] = true;
			if (current_selected !== null)
			{
				selected_state[current_selected[1]][current_selected[0]] = false;
			}
			current_selected = [row,col];
		}
	}
	
	onMount( () => {
		selected_state = Array.from(Array(cols), () => Array(rows).fill(false));
	});
</script>

<div class = "grid_wrapper">
	{#each Array(selected_state.length) as _, col}
		<ul>
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
    :root
    {
        --grid_background: #3f3a3a;
    }

    ul
    {
        list-style:none;
        display:inline-block;

        width:2em;
        height:2em;
        margin:5px;
    }

    .grid_wrapper
    {
        /* margin-left:20%; 
        margin-top:2em; */
        display:block;

        background: var(--grid_background); /*TODO make this match battleship background*/
        /*animation:bgfade 5s;
        -webkit-animation:bgfade 5s;*/ /* Safari and Chrome */
    }
</style>
