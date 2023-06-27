<script>
    import Ship from "./Ship.svelte";
    import Card from "./Card.svelte";

    export let ships = {};
    export let is_placed = {};
    export let on_selected_change = () => {};
    export let on_remove_ship = () => {};
    export let on_confirm_board = () => {};

    let selected_ship_id = null;
    $: ship_rotations = generate_ship_rotations(ships);

    $: all_ships_placed = Object.values(is_placed).every((placed) => placed);

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

    function clear_ships() {
        return () => {
            for (let ship_id in ships) {
                on_remove_ship(ship_id);
            }
        };
    }
</script>

<Card>
    <div class="ship-placement-menu">
        <h2>Place Ships</h2>
        <div class="selected-ship">
            <Ship
                ship={ships[selected_ship_id]}
                rotation={ship_rotations[selected_ship_id]}
            />
        </div>
        <div class="rotation-buttons">
            <button
                class="rotation-button"
                disabled={is_placed[selected_ship_id]}
                on:click={() => rotate_left()}>Rotate Left</button
            >
            <button
                class="rotation-button"
                disabled={is_placed[selected_ship_id]}
                on:click={() => rotate_right()}>Rotate Right</button
            >
        </div>
        <ul class="ship-list">
            {#each Object.entries(ships) as [id, ship]}
                <li
                    class={"ship-selector" +
                        (selected_ship_id == id ? " selected" : "") +
                        (is_placed[id] ? " placed" : "")}
                    on:click={() => select_ship(id)}
                    on:keyup={() => select_ship(id)}
                >
                    {#if is_placed[id]}
                        <span
                            class="ship-selector-clear"
                            on:click={() => on_remove_ship(id)}
                            on:keyup={() => on_remove_ship(id)}
                        />
                    {/if}
                    <div class="ship-selector-ship">
                        <Ship {ship} rotation={ship_rotations[id]} />
                    </div>
                </li>
            {/each}
        </ul>
        <div class="action-buttons">
            <button disabled={!all_ships_placed} on:click={on_confirm_board()}>
                Confirm
            </button>
            <button on:click={clear_ships()}> Clear </button>
        </div>
    </div>
</Card>

<style>
    .ship-placement-menu {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 25em;
    }

    .selected-ship {
        width: 5em;
        height: 5em;
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
        margin: 0.25em;
        padding: 1em;
        width: fit-content;
        position: relative;
    }

    .ship-selector:hover {
        box-shadow: inset 0 0 0 2px grey;
        background-color: #ddd;
    }

    .ship-selector-ship {
        width: 3em;
        height: 3em;
        margin: 0;
        padding: 0;
    }

    .selected {
        background-color: #ddd;
    }

    .placed {
        box-shadow: inset 0 0 0 2px green;
    }

    .ship-selector-clear {
        position: absolute;
        top: 0.25em;
        right: 0.25em;
        cursor: pointer;

        display: inline-grid;
        place-content: center;
        aspect-ratio: 1;
        min-inline-size: 1.25em;
        border-radius: 50%;
        background-color: red;
    }

    .ship-selector-clear::before {
        content: "\D7";
        color: #fff;
        font-weight: bold;
        font-family: sans-serif;
    }

    .action-buttons {
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: 100%;
    }
</style>
