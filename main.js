function renderCards() {
    
    enableSpinner();

    await loadPkms (listStart , listStart + 20)
    currentPkmList = pkmList;
    renderList();
    
    disableSpinner();
    
}

function renderList() {
    let contentBox = document.getElementById("PodexCards");
    contentBox.innerText= "";

}

function enableSpinner() {
   
}

function disableSpinner() {
    
}
