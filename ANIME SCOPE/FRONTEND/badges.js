  

const badgeLibrary = {
      
    pathOfSorcerer: {
          
        5:   { name: "Initiate", color: "#ffffff", aura: "faint-glow" },
        10:  { name: "Grade 4 Sorcerer", color: "#add8e6", aura: "blue-spark" },
        15:  { name: "Grade 3 Sorcerer", color: "#0000ff", aura: "blue-flame" },
        20:  { name: "Grade 2 Sorcerer", color: "#ffff00", aura: "static-yellow" },
        25:  { name: "Grade 1 Sorcerer", color: "#800080", aura: "purple-aura" },
        30:  { name: "Semi-Special Grade", color: "#4b0082", aura: "violet-waves" },
        35:  { name: "Special Grade", color: "#000000", aura: "black-flash-particles" },
        40:  { name: "Domain Master", color: "#dc143c", aura: "crimson-outline" },
        45:  { name: "Six-Eyes Descendant", color: "#00ffff", aura: "electric-cyan" },
        50:  { name: "The Honored One", color: "#ffd700", aura: "heavenly-shine" },

          
        55:  { name: "Cursed Speech User", color: "#ffb6c1", aura: "pink-aura" },
        60:  { name: "Zen’in Clan Heir", color: "#333333", aura: "charcoal-shadow" },
        65:  { name: "Kamo Blood Weaver", color: "#800000", aura: "maroon-pulse" },
        70:  { name: "Infinity Disciple", color: "#00ffff", aura: "azure-orbitals" },
        75:  { name: "Shikigami General", color: "#008000", aura: "emerald-static" },
        80:  { name: "Soul Restorer", color: "#f5f5f5", aura: "pearl-glow" },
        85:  { name: "Black Flash Veteran", color: "#ff0000", aura: "red-black-lightning" },
        90:  { name: "Divergent Striker", color: "#ff00ff", aura: "blue-pink-shift" },
        95:  { name: "Maximum Output", color: "#ff4500", aura: "volcanic-orange" },
        100: { name: "The Awakened One", color: "#c0c0c0", aura: "silver-supernova" },

          
        105: { name: "Void Walker", color: "#483d8b", aura: "space-purple" },
        110: { name: "Star Vessel Protector", color: "#daa520", aura: "golden-stardust" },
        115: { name: "Hidden Inventory", color: "#704214", aura: "sepia-fade" },
        120: { name: "Boundary Breaker", color: "#ffffff", aura: "glass-shards" },
        125: { name: "Spirit Manipulator", color: "#000000", aura: "swirling-mist" },
        130: { name: "Disaster Hunter", color: "#39ff14", aura: "toxic-neon" },
        135: { name: "Shibuya Survivor", color: "#808080", aura: "grey-smoke" },
        140: { name: "The Executioner", color: "#b0c4de", aura: "steel-silver" },
        145: { name: "Culling Game Player", color: "#00ff00", aura: "digital-grid" },
        150: { name: "Ancient Sorcerer", color: "#cd7f32", aura: "gold-rust" },

          
        155: { name: "Ten Shadows Master", color: "#2f4f4f", aura: "animal-shadows" },
        160: { name: "Divine General", color: "#ffffff", aura: "white-lightning" },
        165: { name: "World-Cutter", color: "#add8e6", aura: "space-distortion" },
        170: { name: "Malevolent Chef", color: "#ff0000", aura: "blade-symbols" },
        175: { name: "Soul Architect", color: "#4169e1", aura: "hand-print-aura" },
        180: { name: "Fate Weaver", color: "#ffd700", aura: "thread-pattern" },
        185: { name: "Time Warper", color: "#00008b", aura: "after-image" },
        190: { name: "Reality Bender", color: "#ff00ff", aura: "rainbow-glow" },
        195: { name: "Dimension Hopper", color: "#0000ff", aura: "stargate-blue" },
        200: { name: "The King of Curses", color: "#8b0000", aura: "blood-red-flame" },

          
        205: { name: "Universal Watcher", color: "#9932cc", aura: "nebula-aura" },
        210: { name: "Timeline Guardian", color: "#ffd700", aura: "clock-gear" },
        215: { name: "Multiverse Traveler", color: "#00ffff", aura: "glitch-aura" },
        220: { name: "Soul Reaper", color: "#4b0082", aura: "scythe-glow" },
        225: { name: "Super Saiyan Spirit", color: "#ffff00", aura: "golden-heat" },
        230: { name: "Pirate King’s Will", color: "#ff0000", aura: "haki-pulse" },
        235: { name: "Hokage’s Legacy", color: "#ff8c00", aura: "swirl-pattern" },
        240: { name: "The Absolute Entity", color: "#ffffff", aura: "pure-light" },
        245: { name: "Omnipotent Fan", color: "#fffafa", aura: "starlight" },
        250: { name: "Grand Architect", color: "#ffd700", aura: "dragon-aura" }
    },

      
    chronosArchive: {
        3:  { name: "The Neophyte", color: "#f8f9fa", aura: "white-smoke" },
        6:  { name: "Cursed Energy User", color: "#90ee90", aura: "pale-green-glow" },
        9:  { name: "The Awakened", color: "#008080", aura: "teal-pulse" },
        12: { name: "Year 1: Anniversary Guardian", color: "#c0c0c0", aura: "silver-shine" },
        15: { name: "Steady Streamer", color: "#ffff00", aura: "yellow-sparks" },
        18: { name: "Clan Soldier", color: "#cd7f32", aura: "bronze-outline" },
        21: { name: "Battle Hardened", color: "#708090", aura: "steel-grey" },
        24: { name: "Year 2: Sentinel of Time", color: "#daa520", aura: "gold-aura" },
        27: { name: "Spirit Bonded", color: "#8a2be2", aura: "purple-haze" },
        30: { name: "Veil Walker", color: "#4b0082", aura: "indigo-shadow" },
        33: { name: "Domain Guardian", color: "#9400d3", aura: "violet-static" },
        36: { name: "Year 3: Sage of Seasons", color: "#00a86b", aura: "jade-glow" },
        39: { name: "Mythic Watcher", color: "#ff00ff", aura: "prismatic-shift" },
        42: { name: "Eternal Critic", color: "#dc143c", aura: "blood-glow" },
        45: { name: "Fate Binder", color: "#ffd700", aura: "golden-string" },
        48: { name: "Year 4: The Timeless One", color: "#b9f2ff", aura: "diamond-sparkle" },
        51: { name: "Cosmic Entity", color: "#ff1493", aura: "nebula-texture" },
        54: { name: "Void Sovereign", color: "#000000", aura: "void-distortion" },
        57: { name: "Universe Architect", color: "#4169e1", aura: "galaxy-spiral" },
        60: { name: "Year 5: THE ETERNAL DEITY", color: "#ffffff", aura: "solar-flare" }
    }
};

  


async function loadUserBadges() {
    try {
      
        const response = await fetch('/api/user/badges'); 
        const data = await response.json();
        
        const badgeContainer = document.getElementById('badge-display');
        
    
        data.badges.forEach(badgeName => {
            const img = document.createElement('img');
            img.src = `assets/badges/${badgeName}.png`; 
            img.className = 'badge-icon';
            badgeContainer.appendChild(img);
        });
    } catch (err) {
        console.error("Couldn't load badges:", err);
    }
}

function getEarnedBadge(type, value) {
    const library = badgeLibrary[type];
    if (!library) return null;

    
    const milestones = Object.keys(library).map(Number).sort((a, b) => b - a);

   
    for (let milestone of milestones) {
        if (value >= milestone) {
           
            return library[milestone]; 
        }
    }

    
    if (type === 'pathOfSorcerer') {
        return { name: "ROOKIE", color: "#94a3b8", aura: "unranked-aura" };
    } else {
        return { name: "NEOPHYTE", color: "#94a3b8", aura: "unranked-aura" };
    }
}