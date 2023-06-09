<script>
	import Grid from "./grid.svelte";
  import Menu from "./menu.svelte";

	const r = 2;
	const c = 4; // TODO, make this dynamic eventually
	
	let current_selected;
</script>

<main>
<!-- 	<h1>Battleship Galactica</h1>
	<h2>Welcome to the warzone commander</h2> -->
	
<!-- 	<form>
		<label for='foo'>Rows</label>
		<input id="foo" type="text">
	</form>
	
	<label>
		<input id="User" name="Name" type="text" />
	</label>
	<input> -->
	
	<Grid rows={r} cols={c} reshape='true' resize='true' bind:current_selected={current_selected}/>
	<Menu current_selected={current_selected}/>
	<Grid/>
</main>