
function addPokieCard(pokemonData) {
    return`<div class="pokemon-card ${pokemonData.types[0].type.name}" onclick="showCard('${pokemonData.id} ')" >
        <img src="${pokemonData.sprites.front_default || pokemonData.sprites.other?.['official-artwork']?.front_default }" alt="${pokemonData.name}">
        <h2 class="P_8">${(pokemonData.name).toUpperCase()}</h2>
        <p class="P_8">ID: #${pokemonData.id}</p>
        <p class="P_8">Typ: ${pokemonData.types.map(typeInfo => capitalizeFirstLetters(typeInfo.type.name)).join(', ')}</p>
    </div>
    `;
}

function displayNoResultsCard() {
    return `
        <div class="pokemon-card no-results-card">
            <img src="../img/no-result.png" alt="Keine Ergebnisse gefunden">
            <h2>Keine Pokémons gefunden!</h2>
            <p>Versuche es mit einem anderen Suchbegriff.</p>
        </div>
    `;
}

function pokemonStats(pokemonData) {
    return `
        <div class="flexR pokemonStats">
            ${pokemonData.stats.map(stat => {
                return `<div class="flexC">
                            <b> ${to3abbreviation((stat.stat.name.replace('special-', 's. ').replace('speed', 'pac')).toUpperCase())}:</b>
                                ${stat.base_stat}
                        </div>`;
                }).join('')}
        </div>`;
}

function selectedCardTemplate(pokemonData) {
    const types = pokemonData.types.map(typeInfo => capitalizeFirstLetters(typeInfo.type.name)).join(', ');
    const abilities = pokemonData.abilities.map(abilityInfo => capitalizeFirstLetters(abilityInfo.ability.name)).join(', ');
    const imageUrl = pokemonData.sprites.other?.['official-artwork']?.front_default || pokemonData.sprites.front_default;

    return `
        <div class="detailed-pokemon-card ${pokemonData.types[0].type.name}">
            <img class="overlayImg" src="${imageUrl}" alt="${capitalizeFirstLetters(pokemonData.name)}">
            <h2 class="blackThinBorder">${capitalizeFirstLetters(pokemonData.name)} (#${pokemonData.id})</h2>
            ${pokemonStats(pokemonData)}
            <div class="pokemon-details-content blackThinBorder">
                <p><b>Typ:</b> ${types}</p>
                <p><b>Größe:</b> ${pokemonData.height / 10} m</p>
                <p><b>Gewicht:</b> ${pokemonData.weight / 10} kg</p>
                <p><b>Fähigkeiten:</b> ${abilities}</p>
            </div>
        </div>
    `;
}