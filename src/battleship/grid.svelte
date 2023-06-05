<script>
	import Tile from "./tile.svelte";

	export let rows;
	export let cols; // TODO, make this dynamic eventually
</script>

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

<div class = "grid_wrapper">
    {#each {length: cols} as _, col}
        <!-- Should I use Array({cols}) instead of length? What's the speed difference. TODO -->
        <ul>
            {#each {length: rows}  as _, row}
                <Tile row={row}, col={col}/>
            {/each}
        </ul>
    {/each}
</div>