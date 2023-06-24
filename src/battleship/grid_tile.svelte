<script>
	export let on_click;
	export let is_selected;
    export let tile_style; // One of a few predetermined styles. TODO maybe make an enum
	
    function determine_class(is_selected, current_state){ // TODO would it be more performant to have svelte if blocks define button with a selected class or no class?
        return is_selected? "selected ": "";
    }
    // TODO should I pass in selected style specifications with tile_style, and forgo the whole class thing inside grid_tile?
</script>

<button class = {determine_class(is_selected)} on:click={on_click()} style={tile_style}></button>

<style>
    :root{
        --default_background: #ccc;
        --default_radius: 50%;
        --default_width: 2em;
        --default_height: 2em;
        --default_margin: 5px;
        --default_cursor: pointer; /*TODO-pretty make this different? This is a temprorary choice*/

        --hover_outline: cyan solid medium; /*outline-color | outline-style | outline-width. https://developer.mozilla.org/en-US/docs/Web/CSS/outline*/
        --selected_outline: red solid medium;

        --ship_radius:0%;

        --miss_background: #F5F5F4;
        --hit_background: #AA4A44;

        /* No longer needed variables */
        /* --hover_outline_color: red;
        --hover_outline_style: solid;
        --hover_outline_width: thin; */
        /* --hover_background: #20B2AA; */
        /* --hover_radius: 20%; */
        /* --selected_radius: 0%; */
    }

    button{
        width: var(--default_width);
        height: var(--default_height);
        margin: var(--default_margin);

        background: var(--default_background);
        border-radius: var(--default_radius);

        cursor: var(--default_cursor);
    }
        button:hover{
            /* outline-style: var(--hover_outline_style);
            outline-color: var(--hover_outline_color); */
            outline: var(--hover_outline);
        }

    .selected{ /* This should only change border so it doesn't interfere with the other visual classes*/
        outline: var(--selected_outline);
    }


    /* Predetermined styles, should change things other than what the selection classes change (TODO current_state should be a string that is one of these.  Make enum later)*/
    /*  */
    .ship{
        border-radius: var(--ship_radius);
    }
    
    .miss{
        background: var(--miss_background);
    }

    .hit{
        background: var(--hit_background);
    }
</style>