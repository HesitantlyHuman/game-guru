<script>
  export let current_selected;
  export let on_action; // Take a parameter like a string (TODO enum later) of valid options. Logic function given by battleship
</script>

<div>
  <p>
      Current selected is {current_selected}
  </p>
</div>

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