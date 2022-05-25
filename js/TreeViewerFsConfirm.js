/**
 * Creates a full-screen confirmation menu used for the tree viewer.
 * This widget can easily be generalized to work as a generic confirm
 * menu (not just for the tree viewer).
 *
 * @param root The dom element being registered as a full-screen confirmation menu.
 * @param onOkCallback Callback to fire when ok button is pressed.
 * @param onCancelCallback Callback to fire when cancel button is pressed.
 */
let TreeViewerFsConfirm = function(root, onOkCallback = function(){}, onCancelCallback = function(){}) {

    // Create frequently used variables and references to frequently used dom elements.
    let okBtn = root.querySelector(".tree-viewer-fs-confirm__btn-ok");
    let cancelBtn = root.querySelector(".tree-viewer-fs-confirm__btn-cancel");

    /**
     * Fire onOkCallback. Fired on ok button elem click event.
     */
    let onOkBtnClick = function() {
        onOkCallback();
    };

    /**
     * Fire onCancelBtnClick. Fired on cancel button elem click event.
     */
    let onCancelBtnClick = function() {
        onCancelCallback();
    };

    // Add necessary event listeners to dom elements.
    okBtn.addEventListener("click", onOkBtnClick);
    cancelBtn.addEventListener("click", onCancelBtnClick);

};