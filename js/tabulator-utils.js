function get_scrollable_cell(table, cell, cell_html_string = undefined) {
    // by @cfhaak, https://github.com/NestroyCA/nestroyca-astro-base/blob/main/src/pages/places.astro#L80
    if (cell_html_string === undefined) {
        cell_html_string = cell.getValue();
    }
    var cell_html_element = cell.getElement();
    cell_html_element.style.whiteSpace = "pre-wrap";
    cell_html_element.style.overflow = "auto";
    cell_html_element.style.maxHeight = "100px";
    let final_val = table.emptyToSpace(cell_html_string);
    return final_val;
}