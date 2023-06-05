<script>
	import Grid from "./grid.svelte";

	const r = 10;
	const c = 10; // TODO, make this dynamic eventually
</script>

<!-- <style>

</style> -->

<main>
	<h1>Battleship Galactica</h1>
	<h2>Welcome to the warzone commander</h2>

	<Grid rows={r}, cols={c}/>

</main>