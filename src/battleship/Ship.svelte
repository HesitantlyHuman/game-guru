<script>
    import { onMount } from "svelte";

    export let ship;
    export let rotation = 0;

    $: display_ship = render_ship(ship, rotation);

    function render_90(ship) {
        let new_ship = [];
        for (let i = 0; i < ship[0].length; i++) {
            let row = [];
            for (let j = ship.length - 1; j >= 0; j--) {
                row.push(ship[j][i]);
            }
            new_ship.push(row);
        }
        return new_ship;
    }

    function render_180(ship) {
        let new_ship = [];
        for (let i = ship.length - 1; i >= 0; i--) {
            let row = [];
            for (let j = ship[0].length - 1; j >= 0; j--) {
                row.push(ship[i][j]);
            }
            new_ship.push(row);
        }
        return new_ship;
    }

    function render_270(ship) {
        let new_ship = [];
        for (let i = ship[0].length - 1; i >= 0; i--) {
            let row = [];
            for (let j = 0; j < ship.length; j++) {
                row.push(ship[j][i]);
            }
            new_ship.push(row);
        }
        return new_ship;
    }

    function render_ship(ship, rotation) {
        if (!ship) {
            return [[]];
        }
        if (rotation == 0) {
            return ship;
        } else if (rotation == 1) {
            return render_90(ship);
        } else if (rotation == 2) {
            return render_180(ship);
        } else if (rotation == 3) {
            return render_270(ship);
        }
    }
</script>

<table class="ship" cellpadding="0" cellspacing="0">
    {#each display_ship as row}
        <tr class="ship-row">
            {#each row as col}
                <td class={col ? "tile ship-tile" : "tile empty-tile"} />
            {/each}
        </tr>
    {/each}
</table>

<style>
    .ship-tile {
        background-color: #000000;
    }

    .empty-tile {
        background-color: none;
    }

    .ship {
        table-layout: fixed;
        width: 100%;
        height: 100%;
    }
</style>
