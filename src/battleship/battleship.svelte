<script>
	import Grid from "./grid.svelte";
  import Menu from "./menu.svelte";

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
	
	<Grid bind:rows={r} bind:cols={c} reshape='true' resize='true' bind:current_selected={top_selected}/>
	<Menu current_selected={top_selected}/>
	<Grid rows={r} cols={c}/>
</main>