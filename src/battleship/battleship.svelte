<script>
	import Grid from "./grid.svelte";
	import Fire_Menu from "./fireing_menu.svelte";
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
</script>

<main>
	<h1>Battleship Galactica</h1>
	<h2>Welcome to the warzone commander!</h2>

	<Shaper bind:rows={r} bind:cols={c} reshape="true" />
	{#key [r, c]}
		<Grid rows={r} cols={c} bind:current_selected={top_selected} />
		<Fire_Menu current_selected={top_selected} />
		<Grid rows={r} cols={c} />
	{/key}
	<ShipPlacementMenu
		ships={{
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
		}}
	/>
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
