<script>
	export let on_click;
	export let is_selected;
    export let current_state; // One of a few predetermined styles. TODO maybe make an enum
	
    function determine_class(is_selected, current_state){
        return (is_selected? "selected ": "") + current_state;
    }
</script>

<button class = {determine_class(is_selected, current_state)} on:click={on_click()}></button>

<style>
    :root{
        --default_background: #ccc;
        --default_radius: 50%;
        --default_width: 2em;
        --default_height: 2em;
        --default_margin: 5px;
        --default_cursor: pointer; /*TODO-pretty make this different? This is a temprorary choice*/

        --hover_outline: red solid thin; /*outline-color | outline-style | outline-width. https://developer.mozilla.org/en-US/docs/Web/CSS/outline*/

        --selected_outline_color: yellow;
        --selected_outline_style: solid;
        --selected_outline: solid thick;

        --ship_radius:0%;

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
        outline-style: var(--selected_outline_style);
        outline-color: var(--selected_outline_color);
    }


    /* Predetermined styles, should change things other than what the selection classes change (TODO current_state should be a string that is one of these.  Make enum later)*/
    .ship{
        border-radius: var(--ship_radius);
    }
    
    .miss{
        background:;
    }

    .hit{
        /*  */
    }
</style>