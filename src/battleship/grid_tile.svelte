<script>
	export let on_click;
	export let is_selected;
    export let current_state; // One of a few predetermined styles. TODO maybe make an enum
	
	// function handle_click(){ // TODO 
	// 	on_click();
	// }
</script>

<button class = {is_selected? "selected": "unselected"} on:click={on_click()}></button>

<style>
    :root{
        --unselected_radius: 50%;
        --hover_radius: 20%;
        --selected_radius: 0%;

        --default_background: #ccc;
        --body_background: #3f3a3a;
        --hover_background: #20B2AA;
        --hover_outline_color: red;
    }

    .unselected{
        width:2em;
        height:2em;
        margin:5px;

        background: var(--default_background);
        border-radius: var(--unselected_radius);
        cursor:pointer;
    }

    .unselected:hover{
        background: var(--hover_background);
        border-radius: var(--hover_radius);
			
        outline-style: solid;
        outline-color: var(--hover_outline_color);
    }
	
	.selected{
        width:2em;
        height:2em;
        margin:5px;

        background: blue;
        border-radius: var(--selected_radius);
        cursor:pointer;
   }
	
	.selected:hover{
		outline-style: solid;
    outline-color: var(--hover_outline_color);
	}
</style>