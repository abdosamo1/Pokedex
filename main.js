const PODEX_CARDS = document.getElementById('PodexCards');
const LOAD_MORE_BUTTON = document.getElementById('load-more-button');
const LOADING_SPINNER = document.getElementById('loading-spinner');
const BODY = document.getElementById('body')
const POKEMON_SEARCH_INPUT = document.getElementById('pokemon-search-input');
const SEARCH_HINT_MESSAGE = document.getElementById('search-hint-message');
const OVERLAY = document.getElementById('overlay');
const OVERLAY_CONTENT = document.getElementById('selectedCard');
const PREV_BUTTON = document.getElementById('previousButton');
const NEXT_BUTTON = document.getElementById('nextButton');

let allPokemonNames = [];
let currentOverlayPokemonId = null;
let currentActivePokemonList = [];
let currentOverlayPokemonIndex = -1;
let offset = 0;
let limit = 20;

async function renderCards() {

    enableSpinner();
    await createPokemonList();
    disableSpinner();
}

async function createPokemonList(){
    try {
        let result = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
        let pokemonList = await result.json();
        let pokemonUrls = pokemonList.results.map(pokemon => pokemon.url);
        
        currentActivePokemonList.push(...pokemonList.results);
        for (let url of pokemonUrls) {
            await createPokemonCard(url);
        }
        offset += limit;

    } catch (error) {
        console.error('Fehler beim Laden der Pokémon-Liste:', error);
    }
}

async function createPokemonCard(pokemonUrl) {
    try {
        let response = await fetch(pokemonUrl);
        let pokemonData = await response.json();

        PODEX_CARDS.innerHTML += addPokieCard(pokemonData)

    } catch (error) {
        console.error('Fehler beim Laden der Pokémon-Details:', error);
    }
}

function enableSpinner() {
   LOADING_SPINNER.classList.remove('hidden');
   LOAD_MORE_BUTTON.disabled = true;
   BODY.classList.add('no-scroll');
}

function disableSpinner() {
    LOADING_SPINNER.classList.add('hidden');
    LOAD_MORE_BUTTON.disabled = false;
    BODY.classList.remove('no-scroll');
}

function capitalizeFirstLetters(text) {
    let words = text.split(' ');
    let transformedWords = words.map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return transformedWords.join(' ');
}

function toThreeAbbreviation(text) {
    let words = text.split(' ');
    let transformedWords = words.map(word => {
        if (word.length >= 3) {
            return word.substring(0, 3);
        } else {
            return word;
        }
    });
    return transformedWords.join(' ');
}

async function handleSearchInput() {
    const userInput = POKEMON_SEARCH_INPUT.value.trim();

    if (userInput.length === 0){
        offset = 0;
        PODEX_CARDS.innerHTML = '';
        await renderCards();
        LOAD_MORE_BUTTON.style.display='block';
    }else if (userInput.length < 3) {
        showSearchHint();
    } else {
        hideSearchHint();
        await searchPokemons(userInput);
    }
}

function showSearchHint() {
    SEARCH_HINT_MESSAGE.classList.remove('hidden');
}

function hideSearchHint() {
    SEARCH_HINT_MESSAGE.classList.add('hidden');
}

let searchPokemons = async input => {

    enableSpinner();

    await allPokemons();

    await search(input);

    disableSpinner();
};

async function allPokemons() {
    try {
        let response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1302');
        let pokemonList = await response.json();
        
        allPokemonNames = pokemonList.results;
    } catch (error) {
        console.error('Fehler beim Laden aller Pokémon-Namen:', error);
    }
}

async function search(input) {
    try {
        let searchTerm = input.toLowerCase();
        let filteredPokemon = allPokemonNames.filter(pokemon => pokemon.name.includes(searchTerm));

        if (filteredPokemon.length === 0) {
            noResultCard();
        }else{
            await renderSearchedCards(searchTerm);
        }
    } catch (error) {
        PODEX_CARDS.innerHTML = `<p style="color: red;">Fehler bei der Suche</p>`;
    }
}

function noResultCard() {
    PODEX_CARDS.innerHTML = '';
    offset = 0;
    PODEX_CARDS.innerHTML = displayNoResultsCard();
    LOAD_MORE_BUTTON.style.display = 'none';
}

async function renderSearchedCards(searchTerm) {
    let filteredPokemon = allPokemonNames.filter(pokemon => pokemon.name.includes(searchTerm));
    let pokemonToRender = filteredPokemon.slice(0, limit);
    let pokemonUrlsToRender = pokemonToRender.map(pokemon => pokemon.url);
    PODEX_CARDS.innerHTML = '';
    offset = 0;
    currentActivePokemonList = [];
    currentActivePokemonList.push(...pokemonToRender);

    for (const url of pokemonUrlsToRender) {
        await createPokemonCard(url);
    }
    if (filteredPokemon.length > limit) {
        LOAD_MORE_BUTTON.style.display = 'block';
    } else {
        LOAD_MORE_BUTTON.style.display = 'none';
    }
}

function openOverlay(index) {
    OVERLAY.classList.toggle("d_none");
    BODY.style.overflow = 'hidden';
    currentOverlayPokemonIndex = index
    handleNavBtns();
}

function closeOverlay() {
    OVERLAY.classList.add('d_none');
    BODY.style.overflow = 'visible';
    currentOverlayPokemonIndex = -1;
    handleNavBtns();
}

async function showCard(pokemonId) {
    currentOverlayPokemonIndex = currentActivePokemonList.findIndex(p => {
        let urlParts = p.url.split('/');
        let idFromUrl = urlParts[urlParts.length - 2];
        return idFromUrl === pokemonId.toString();
    });
    openOverlay(currentOverlayPokemonIndex);
    enableSpinner()
    showSelectedCard(pokemonId).then(
        disableSpinner)
}

async function showSelectedCard(pokemonId) {
    try {
        let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        let pokemonData = await response.json();
        currentOverlayPokemonId = pokemonData.id;
        OVERLAY_CONTENT.innerHTML = selectedCardTemplate(pokemonData);

        if (currentOverlayPokemonIndex === -1 && currentActivePokemonList.length > 0) {
            currentOverlayPokemonIndex = currentActivePokemonList.findIndex(p => {
                let urlParts = p.url.split('/');
                let idFromUrl = urlParts[urlParts.length - 2];
                return idFromUrl === currentOverlayPokemonId.toString();
            });
        }
        handleNavBtns(currentOverlayPokemonIndex);
        } catch (error) {
        console.error('Fehler beim Laden oder Anzeigen der ausgewählten Karte:', error);
        OVERLAY_CONTENT.innerHTML = `<p style="color: red;">Fehler beim Laden der Pokémon-Details für '${pokemonId}'.</p>`;
    }
}

function handleNavBtns(currentOverlayPokemonIndex) {
    const NEXT_BTN_DIV = document.getElementById('navNextBtn');
    const PREV_BTN_DIV = document.getElementById('navPrevBtn');
    if(currentOverlayPokemonIndex <= 0 || currentActivePokemonList.length === 0){
        PREV_BUTTON.disabled  = true;
        PREV_BTN_DIV.classList.add('disabled' , 'no_hover');
    }else if(currentOverlayPokemonIndex >= currentActivePokemonList.length - 1 || currentOverlayPokemonIndex === -1 || currentActivePokemonList.length === 0){
        NEXT_BUTTON.disabled = true;
        NEXT_BTN_DIV.classList.add('disabled' , 'no_hover');
    }else{
        PREV_BUTTON.disabled= false;
        NEXT_BUTTON.disabled= false;
        PREV_BTN_DIV.classList.remove('disabled' , 'no_hover');
        NEXT_BTN_DIV.classList.remove('disabled' , 'no_hover');
    }
}

async function nextCard() {
    if (currentActivePokemonList.length === 0 || currentOverlayPokemonIndex === -1) return;

    if (currentOverlayPokemonIndex < currentActivePokemonList.length - 1) {
        currentOverlayPokemonIndex++;
        let nextPokemon = currentActivePokemonList[currentOverlayPokemonIndex];
        let urlParts = nextPokemon.url.split('/');
        let nextPokemonId = urlParts[urlParts.length - 2];
        await showSelectedCard(nextPokemonId);
    }
}

async function previousCard() {
    if (currentActivePokemonList.length === 0 || currentOverlayPokemonIndex === -1) return;

    if (currentOverlayPokemonIndex > 0) {
        currentOverlayPokemonIndex--;
        let prevPokemonEntry = currentActivePokemonList[currentOverlayPokemonIndex];
        let urlParts = prevPokemonEntry.url.split('/');
        let prevPokemonId = urlParts[urlParts.length - 2];
        await showSelectedCard(prevPokemonId);
    }
}