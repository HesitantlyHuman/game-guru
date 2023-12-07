<script>
    export let on_click;
    export let state;

    export let hovered = false;

    function determine_class(state) {
        return (
            (state.selected ? "selected " : "") +
            (state.ship ? "ship " : "") +
            (state.shot ? "shot" : "")
        );
    }
</script>

<button
    class={determine_class(state)}
    on:click={on_click()}
    on:mouseenter={() => {
        hovered = true;
    }}
    on:mouseleave={() => {
        hovered = false;
    }}
>
</button>

<style>
    :root {
        --default_background: #ccc;
        --default_radius: 50%;
        --default_width: 2em;
        --default_height: 2em;
        --default_margin: 0.4em;
        --default_cursor: pointer; /*TODO-pretty make this different? This is a temprorary choice*/

        --hover_outline: cyan solid medium; /*outline-color | outline-style | outline-width. https://developer.mozilla.org/en-US/docs/Web/CSS/outline*/
        --selected_outline: red solid medium;

        --ship_radius: 0%;

        --miss_background: #f5f5f4;
        --hit_background: #aa4a44;

        /* No longer needed variables */
        /* --hover_outline_color: red;
        --hover_outline_style: solid;
        --hover_outline_width: thin; */
        /* --hover_background: #20B2AA; */
        /* --hover_radius: 20%; */
        /* --selected_radius: 0%; */
    }

    button {
        width: var(--default_width);
        height: var(--default_height);
        margin: var(--default_margin);

        background: var(--default_background);
        border-radius: var(--default_radius);

        cursor: var(--default_cursor);
    }
    button:hover {
        /* outline-style: var(--hover_outline_style);
            outline-color: var(--hover_outline_color); */
        outline: var(--hover_outline);
    }

    /* State classes */
    .selected {
        /* This should only change border so it doesn't interfere with the other visual classes*/
        outline: var(--selected_outline);
    }

    .ship {
        border-radius: var(--ship_radius);
    }

    .shot:not(.ship) {
        /* miss */
        background: var(--miss_background);
    }

    .shot.ship {
        /* hit */
        background: var(--hit_background);
    }
</style>
