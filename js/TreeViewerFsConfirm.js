let TreeViewerFsConfirm = function(root, onOkCallback = function(){}, onCancelCallback = function(){}) {

    let okBtn = root.querySelector(".tree-viewer-fs-confirm__btn-ok");
    let cancelBtn = root.querySelector(".tree-viewer-fs-confirm__btn-cancel");

    let onOkBtnClick = function() {
        onOkCallback();
    };

    let onCancelBtnClick = function() {
        onCancelCallback();
    };

    okBtn.addEventListener("click", onOkBtnClick);
    cancelBtn.addEventListener("click", onCancelBtnClick);

};