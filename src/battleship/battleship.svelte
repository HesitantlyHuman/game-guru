<script>
	import Grid from "./grid.svelte";
	import Action_Menu from "./action_menu.svelte";
	import Shaper from "./grid_shaper.svelte"

	let r = 3;
	let c = 5; // TODO, make this dynamic eventually
	
	// Grid variables
	let top_selected;
	let bottom_selected;
	let top_size;
	let bottom_size;
	let same_size = false;

	/**
	 TODO:
	 - Deselect something when an action is taken
	*/
</script>

<main>
	<h1>Battleship Galactica</h1>
	<h2>Welcome to the warzone commander!</h2>
	
	<Shaper bind:rows={r} bind:cols={c} reshape='true'/>
	{#key [r,c]}
		<Grid rows={r} cols={c} bind:current_selected={top_selected}/>
		<Action_Menu current_selected={top_selected}/>
		<Grid rows={r} cols={c}/>
	{/key}
</main>

<style>
	:root{
		--background_color: #c0641d;
		/* Use the 6 or 8 value hex syntax for colors */
	}

	main{
		background: var(--background_color);
	}
</style>