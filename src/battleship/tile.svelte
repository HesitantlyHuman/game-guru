<script>
    export let row;
    export let col;
</script>

<style>
    :root
    {
        --unselected_radius: 50%;
        --hover_radius: 0%;
        --selected_radius: 10%;

        --default_background: #ccc;
        --body_background: #3f3a3a;
        --hover_background: #20B2AA;
        --hover_outline: red;
    }

    .dot
    {
        width:2em;
        height:2em;
        margin:5px;

        background: var(--default_background);
        border-radius: var(--unselected_radius);
        cursor:pointer;
    }

    .dot:hover
    {
        background: var(--hover_background);
        border-radius: var(--hover_radius);
        outline-style: solid;
        outline-color: var(--hover_outline);
    }
</style>

<li class = "dot"></li>