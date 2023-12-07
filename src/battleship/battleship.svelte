<script>
	import Grid from "./grid.svelte";
	import Action_Menu from "./action_menu.svelte";
	import Shaper from "./grid_shaper.svelte";
	import ShipPlacementMenu from "./ship_placement_menu.svelte";

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
	let ships = {
		"ship-1": [
			[1, 1, 0],
			[0, 1, 0],
			[0, 1, 1],
		],
		"ship-2": [
			[1, 0, 0],
			[1, 0, 0],
			[1, 1, 1],
		],
		"ship-3": [[1], [1]],
		"ship-4": [
			[1, 0],
			[1, 1],
			[0, 1],
			[0, 1],
		],
	};
	let is_placed = {
		"ship-1": false,
		"ship-2": false,
		"ship-3": false,
		"ship-4": false,
	};
	let selected_ship_id = null;

	function select_ship(ship_id) {
		selected_ship_id = ship_id;
	}
</script>

<main>
	<h1>Battleship Galactica</h1>
	<h2>Welcome to the warzone commander!</h2>

	<Shaper bind:rows={r} bind:cols={c} reshape="true" />
	{#key [r, c]}
		<Grid rows={r} cols={c} bind:current_selected={top_selected} />
		<Action_Menu current_selected={top_selected} />
		<Grid rows={r} cols={c} />
	{/key}
	<ShipPlacementMenu
		{ships}
		{is_placed}
		on_remove_ship={(ship_id) => {
			is_placed[ship_id] = false;
		}}
		on_selected_change={(ship_id, rotation) => {
			select_ship(ship_id);
		}}
	/>
	<button on:click={() => (is_placed[selected_ship_id] = true)}>Place</button>
</main>

<style>
	:root {
		--background_color: #c0641d;
		/* Use the 6 or 8 value hex syntax for colors */
	}

	main {
		background: var(--background_color);
	}
</style>
