<!-- TODO if we ever add extreme additions to the game (like nukes, etc), have confirm be a popup? "confirm()"?-->

<script>
  export let current_selected;
  export let actions = []; // Array of 2 celled arrays, where each sub array is [action name, function it performs]. TODO make this a dictionary and then iterate via Object.entries? Would that be better?
</script>

<div>
  <h2>Selected index: {current_selected}</h2>
  {#key current_selected}
    <ul>
      {#each actions as [action, func]}
        <div class="display_action">
          <span class="action_description">{action}</span>
          <button class="action_button" on:click()={func()}></button>
        </div>
      {/each}
    </ul>
  {/key}
</div>
<!-- TODO add a confirmation (preferable something simple like the button itself changing to "confirm?") to the action button -->

<style>
  .display_action{
    display: flex;
  }

  .action_description, .action_button{
    flex: 1 1;
  }
</style>


<!-- TODO cosmetics, make pretty container? -->
<!-- <div id="menu-container">
  {#if menuVisible}
    <div id="menu" style="left: {menuPosition.x}px; top: {menuPosition.y}px;">
      <ul>
        <li class="menu-option">Option 1 (Row: {selectedGrid.row}, Col: {selectedGrid.col})</li>
        <li class="menu-option">Option 2 (Row: {selectedGrid.row}, Col: {selectedGrid.col})</li>
        <li class="menu-option">Option 3 (Row: {selectedGrid.row}, Col: {selectedGrid.col})</li>
      </ul>
    </div>
  {/if}
</div>
 -->