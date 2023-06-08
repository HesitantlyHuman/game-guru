<!-- <script>
	import Grid from "./grid.svelte";
    import Menu from "./menu.svelte";

	const r = 10;
	const c = 10; // TODO, make this dynamic eventually
</script>

<main>
	<h1>Battleship Galactica</h1>
	<h2>Welcome to the warzone commander</h2>

	<Grid rows={r}, cols={c}/>
	<Menu />
</main> -->

<script>
	import Grid from "./grid.svelte";
  import Menu from "./menu.svelte";

	const r = 5;
	const c = 6; // TODO, make this dynamic eventually
	
	let current_selected;
</script>

<!-- <style>

</style> -->

<main>
	<h1>Battleship Galactica</h1>
	<h2>Welcome to the warzone commander</h2>
	
	<button>Rows</button>
	<button>Columns</button>
	<Grid rows={r} cols={c} bind:current_selected={current_selected}/>
	<Menu current_selected={current_selected}/>
</main>