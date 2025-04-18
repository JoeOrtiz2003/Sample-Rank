const sheetID = "1srwCRcCf_grbInfDSURVzXXRqIqxQ6_IIPG-4_gnSY8";
const sheetName = "LIVE";
const query = "select AX, AY, AZ, BA, BB"; // Adjust to your column setup
const sheetURL = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&tq=${encodeURIComponent(query)}`;

// Create 18 rankingElement blocks dynamically
function createRankingElements(count = 21) {
    const wrapper = document.getElementById("rankingElementsWrapper");
    wrapper.innerHTML = ""; // Clear previous elements if any

    for (let i = 1; i <= count; i++) {
        const div = document.createElement("div");
        div.className = "rankingElement";
        div.setAttribute("data-position", i);
        div.innerHTML = `
            <div class="rankingElementBackground"></div>
            <div class="rankingElementWrapper">
                <p class="rankingElementRank"></p>
                <div class="rankingElementLogoWrapper">
                    <div class="rankingElementNoLogo"></div>
                    <img class="rankingElementLogo" src="logo.png" alt="Logo" />
                    <p class="rankingElementName"></p>
                </div>
                <div class="rankingElementAliveWrapper">
                    <div class="rankingElementAlive"></div>
                    <div class="rankingElementAlive"></div>
                    <div class="rankingElementAlive"></div>
                    <div class="rankingElementAlive"></div>
                </div>
                <p class="rankingElementKills"></p>
            </div>
        `;
        wrapper.appendChild(div);
    }
}

async function fetchRankingData() {
    try {
        console.log("Fetching data from:", sheetURL);
        const response = await fetch(sheetURL);
        const text = await response.text();
        const jsonText = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);/);
        if (!jsonText) throw new Error("Invalid JSON format");

        const jsonData = JSON.parse(jsonText[1]);
        const rows = jsonData.table.rows.map(row => ({
            rank: row.c[0]?.v ?? "#",
            team: row.c[1]?.v?.toString().trim() ?? "Unknown",
            elims: row.c[2]?.v ?? 0,
            logo: row.c[3]?.v ?? "https://placehold.co/22x22/000000/FFF?text=?",
            alive: row.c[4]?.v ?? 0
        }));

        updateRankingElements(rows);
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

function updateRankingElements(data) {
    const elements = document.querySelectorAll(".rankingElement");

    data.forEach((teamData, index) => {
        const element = elements[index];
        if (!element) return;

        const rankEl = element.querySelector(".rankingElementRank");
        const nameEl = element.querySelector(".rankingElementName");
        const logoEl = element.querySelector(".rankingElementLogo");
        const killsEl = element.querySelector(".rankingElementKills");
        const aliveBoxes = element.querySelectorAll(".rankingElementAlive");

        if (rankEl) rankEl.textContent = `#${teamData.rank}`;
        if (nameEl) nameEl.textContent = teamData.team;
        if (logoEl) logoEl.src = teamData.logo;
        if (killsEl) killsEl.textContent = teamData.elims;

        // Update alive indicators
        aliveBoxes.forEach((box, i) => {
            box.style.backgroundColor = i < teamData.alive ? "#fff" : "#2c2102";
        });

        // Fade the whole team block if alive is 0
        if (teamData.alive === 0) {
            element.classList.add("fadedTeam");
        } else {
            element.classList.remove("fadedTeam");
        }
    });
}


// Initialize page
createRankingElements(16);
fetchRankingData();
setInterval(fetchRankingData, 10);
