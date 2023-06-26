<script>
    import Ship from "./Ship.svelte";
    import Card from "./Card.svelte";

    export let ships;
    export let is_placed;
    export let on_selected_change = () => {};
    export let on_remove_ship = () => {};
    export let on_confirm_board = () => {};

    let selected_ship_id = null;
    $: ship_rotations = generate_ship_rotations(ships);

    function generate_ship_rotations(ships) {
        let rotations = {};
        for (let ship_id in ships) {
            rotations[ship_id] = 0;
        }
        return rotations;
    }

    function select_ship(ship_id) {
        selected_ship_id = ship_id;
        on_selected_change(selected_ship_id, ship_rotations[selected_ship_id]);
    }

    function rotate_left() {
        if (ship_rotations[selected_ship_id] == 0) {
            ship_rotations[selected_ship_id] = 4;
        }
        ship_rotations[selected_ship_id] =
            (ship_rotations[selected_ship_id] - 1) % 4;
        on_selected_change(selected_ship_id, ship_rotations[selected_ship_id]);
    }
    function rotate_right() {
        ship_rotations[selected_ship_id] =
            (ship_rotations[selected_ship_id] + 1) % 4;
        on_selected_change(selected_ship_id, ship_rotations[selected_ship_id]);
    }
</script>

<Card>
    <div class="ship-placement-menu">
        <h1>Select Ship</h1>
        <div class="selected-ship">
            <Ship
                ship={ships[selected_ship_id]}
                rotation={ship_rotations[selected_ship_id]}
            />
        </div>
        <div class="rotation-buttons">
            <button class="rotation-button" on:click={() => rotate_left()}
                >Rotate Left</button
            >
            <button class="rotation-button" on:click={() => rotate_right()}
                >Rotate Right</button
            >
        </div>
        <ul class="ship-list">
            {#each Object.entries(ships) as [id, ship]}
                <li
                    class={"ship-selector" +
                        (selected_ship_id == id ? " selected" : "")}
                    on:click={() => select_ship(id)}
                    on:keyup={() => select_ship(id)}
                >
                    <div class="ship-selector-ship">
                        <Ship {ship} rotation={ship_rotations[id]} />
                    </div>
                </li>
            {/each}
        </ul>
    </div>
</Card>

<style>
    .ship-placement-menu {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 15em;
    }

    .selected-ship {
        width: 30%;
        aspect-ratio: 1;
    }

    .rotation-buttons {
        display: flex;
        flex-direction: row;
    }

    .rotation-button {
        margin: 5px;
    }

    .ship-list {
        display: flex;
        flex-direction: row;
        list-style-type: none;
        justify-content: center;
        width: 100%;
        padding: 0;
        margin: 0;
    }

    .ship-selector {
        padding: 1em;
        width: fit-content;
    }

    .ship-selector:hover {
        box-shadow: inset 0 0 0 2px grey;
    }

    .ship-selector-ship {
        width: 3em;
        aspect-ratio: 1;
        margin: 0;
        padding: 0;
    }

    .selected {
        background-color: #ddd;
    }
</style>
