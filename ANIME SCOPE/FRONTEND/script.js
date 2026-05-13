const container = document.getElementById("anime-container"), 
      search = document.getElementById("search"), 
      themeBtn = document.getElementById("theme-btn"), 
      loader = document.getElementById("loader"), 
      slider = document.getElementById("trending-slider");
  const scrollStep = 330;       
let animeList = [], 
    page = 1, 
    loading = false, 
    searching = false, 
    currentGenreId = 0, 
    seenIds = new Set(), 
    searchStartPos = 0;



          
(function repairUserDatabase() {
    let users = JSON.parse(localStorage.getItem("animeScope_users")) || [];
    let updated = false;

    users.forEach(u => {
        if (!u.joinDate) {
                  
            u.joinDate = "2026-01-01T00:00:00.000Z"; 
            updated = true;
        }
    });

    if (updated) {
        localStorage.setItem("animeScope_users", JSON.stringify(users));
        console.log("MAINFRAME REPAIRED: All users now have a Chronos timestamp.");
    }
})();
      
const toggle = document.getElementById("toggle");

      
if(localStorage.getItem("animeTheme") === "light"){
    if(toggle) toggle.checked = false;
    document.body.classList.add("light-theme");
} else {
    if(toggle) toggle.checked = true;
    document.body.classList.remove("light-theme");
}

if(toggle) {
    toggle.addEventListener("change",()=>{
        if(toggle.checked){
            document.body.classList.remove("light-theme");
            localStorage.setItem("animeTheme","dark");
        }else{
            document.body.classList.add("light-theme");
            localStorage.setItem("animeTheme","light");
        }
    });
}

      
function checkAuth() {
    const u = localStorage.getItem("currentUser");
    if (u) {
        syncMainframeData(u);
        document.getElementById("user-status").innerHTML = `
        <button onclick="saveState(); location.href='profile.html'" class="profile-link">
            ${u}
        </button>
        <button onclick="
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        location.reload();
        " class="login-trigger" style="padding:4px 8px; font-size:8px;">
        Logout
        </button>
        `;
    }
}

      
function saveState() {
    const slider = document.getElementById("trending-slider");
    const genreList = document.getElementById("genre-list");       
    
    const state = {
        animeList: animeList,
        page: page,
        scrollPos: window.scrollY,
        sliderPos: slider ? slider.scrollLeft : 0, 
        genreScrollPos: genreList ? genreList.scrollLeft : 0,       
        currentGenreId: currentGenreId,
        isSearching: searching,
        searchQuery: search.value,
        searchStartPos: searchStartPos,
        trendingVisible: document.getElementById("trending-section").style.display !== "none"
    };
    sessionStorage.setItem("animeScopeState", JSON.stringify(state));
}

 async function syncMainframeData(username) {
    try {
        const res = await fetch(`https://anime-scope-basecode.onrender.com/api/users/data/${username}`);
        if (!res.ok) return; 

        const data = await res.json();

       
        localStorage.setItem(`favorites_${username}`, JSON.stringify(data.favourites));
        localStorage.setItem(`watchlist_${username}`, JSON.stringify(data.watchLater));
        localStorage.setItem(`completed_${username}`, JSON.stringify(data.completed));
        
       
        if (data.ratings) {
            data.ratings.forEach(rating => {
                let fbKey = `fb_${rating.animeId}`;
                let fb = JSON.parse(localStorage.getItem(fbKey)) || { ratings: {}, comments: [] };
                fb.ratings[username] = rating.score;
                localStorage.setItem(fbKey, JSON.stringify(fb));
            });
        }

        
        if (data.comments) {
            data.comments.forEach(comment => {
                let fbKey = `fb_${comment.animeId}`;
                let fb = JSON.parse(localStorage.getItem(fbKey)) || { ratings: {}, comments: [] };
                
                
                const exists = fb.comments.some(c => c.user === username && c.text === comment.text);
                if (!exists) {
                    
                    fb.comments.push({ user: username, text: comment.text, date: comment.date });
                    localStorage.setItem(fbKey, JSON.stringify(fb));
                }
            });
        }

        console.log("MAINFRAME SYNCED: Lists, Ratings, and Comments fully downloaded.");
        
        if (typeof render === "function" && animeList.length > 0) {
            render(animeList, true); 
        }
    } catch (error) {
        console.error("Sync failed:", error);
    }
}    
async function getAnime(isRetry = false) {
    if ((loading || searching) && !isRetry) return;
    loading = true; 
    if(loader) loader.style.display = "block";
    
    const url = currentGenreId === 0 
        ? `https://api.jikan.moe/v4/top/anime?page=${page}` 
        : `https://api.jikan.moe/v4/anime?genres=${currentGenreId}&page=${page}&order_by=score&sort=desc`;
    
    try {
        const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}cb=${Date.now()}`);
        const data = await res.json();
        if (data.data) {
            data.data.forEach(a => { 
                if(!seenIds.has(a.mal_id)){ 
                    seenIds.add(a.mal_id); 
                    animeList.push(a); 
                } 
            });
            render(animeList, page === 1); 
            page++;
        }
    } catch(e) {
        console.error("Fetch failed", e);
    }
    loading = false; 
    if(loader) loader.style.display = "none";
}

function render(list, clear=false){
    if(clear){
        container.innerHTML="";
        seenIds.clear();
        list.forEach(a=>seenIds.add(a.mal_id));
    }

           
    let filteredList = list;
    if (searching) {
        const q = search.value.toLowerCase().trim();
        filteredList = list.filter(a => {
            const titleMain = (a.title || "").toLowerCase();
            const titleEng = (a.title_english || "").toLowerCase();
            return titleMain.includes(q) || titleEng.includes(q);
        });
    }

           
    const sorted = searching ? filteredList : [...filteredList].sort((a,b)=>(b.score||0)-(a.score||0));

    const user = localStorage.getItem("currentUser");
           
    const fav = JSON.parse(localStorage.getItem("favorites_"+user)) || [];
    const watch = JSON.parse(localStorage.getItem("watchlist_"+user)) || [];
    const done = JSON.parse(localStorage.getItem("completed_"+user)) || [];        

    sorted.forEach(a=>{
               
        if(!clear && document.getElementById(`card-${a.mal_id}`)) return;

        const card=document.createElement("div");
        card.className="anime-card";
        card.id=`card-${a.mal_id}`;

               
        const isFav = fav.some(f => (f.mal_id || f) === a.mal_id);
        const isWatch = watch.some(w => (w.mal_id || w) === a.mal_id);
        const isDone = done.some(d => (d.mal_id || d) === a.mal_id);

        card.innerHTML = `
        <div class="card-actions">
            <span class="action-btn ${isFav ? "fav-active remove-action" : "add-action"}"
            onclick="toggleFavorite(${a.mal_id},this)">❤️</span>
            <span class="action-btn ${isWatch ? "watch-active remove-action" : "add-action"}"
            onclick="toggleWatch(${a.mal_id},this)">🔖</span>
            <span class="action-btn ${isDone ? "complete-active remove-action" : "add-action"}"
            onclick="toggleCompleted(${a.mal_id},this)">✔</span>
        </div>
        <a href="anime.html?id=${a.mal_id}" onclick="saveState()" style="text-decoration:none;color:inherit">
            <img src="${a.images.jpg.image_url}" loading="lazy">
            <div class="quick-look">
                <p>Type: ${a.type}</p>
                <p>Eps: ${a.episodes}</p>
            </div>
            <h3 style="font-size:11px;padding:10px 10px 0;height:35px;overflow:hidden;">
                ${a.title_english || a.title}
            </h3>
            <div class="rating ${getRatingClass(a.score)}">⭐ ${a.score || 'N/A'}</div>
        </a>
        `;
        container.appendChild(card);
    });
}
       
async function teleport() { 

    saveState(); 

           

    const excludedGenres = ["boys love", "crossdressing", "girls love", "hentai", "ecchi", "erotica", "idols(female)", "harem"];



    try {

        if(loader) loader.style.display = "block";



               

               

        const randomPage = Math.floor(Math.random() * 5) + 1; 

        

               

        const res = await fetch(`https://api.jikan.moe/v4/top/anime?page=${randomPage}&filter=bypopularity`); 

        const json = await res.json(); 

        const topList = json.data;



               

        const safeHits = topList.filter(anime => {

            const allGenres = [

                ...(anime.genres || []),

                ...(anime.explicit_genres || []),

                ...(anime.themes || [])

            ].map(g => g.name.toLowerCase());



            return !allGenres.some(name => excludedGenres.includes(name));

        });



               

        if (safeHits.length > 0) {

            const finalPick = safeHits[Math.floor(Math.random() * safeHits.length)];

            window.location.href = `anime.html?id=${finalPick.mal_id}`; 

        } else {

                   

            alert("MAINFRAME RESET: No high-tier matches found on this floor. Try again!");

        }



    } catch (e) {

        console.error("Teleport failed:", e);

        alert("PORTAL ERROR: Connection to the Top Charts lost.");

    } finally {

        if(loader) loader.style.display = "none";

    }
}
let timer;
search.oninput = () => {
    const q = search.value.trim();
    const clearBtn = document.getElementById("clear-search");
    
           
    if (clearBtn) clearBtn.style.display = q.length > 0 ? "block" : "none";

    if(!searching && search.value.length === 1){
        searchStartPos = window.scrollY;
    }

    clearTimeout(timer); 

           
    if (!q) {
        resetToMainView();
        return;
    }

   timer = setTimeout(async () => { 
        if (q.length < 1) return; 
        searching = true;
        
               
        document.getElementById("genre-list").style.display = "none"; 
        document.getElementById("trending-section").style.display = "none";
        if(loader) loader.style.display = "block";
        container.innerHTML = ""; 

               
        const mainTitle = document.getElementById("main-title");
        mainTitle.innerHTML = `RESULTS FOR <span style="color:var(--accent)">${q}</span> IS`;

        try {
            const res = await fetch(`https://api.jikan.moe/v4/anime?q=${q}&order_by=score&sort=desc`);
            const d = await res.json(); 
            
            if (d.data && d.data.length > 0) {
                render(d.data, true); 
            } else {
                        
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align:center; padding: 80px 20px;">
                        <h2 style="font-family:'Orbitron'; color:var(--accent); letter-spacing: 5px; text-shadow: 0 0 10px var(--accent); animation: pulseGlow 1.5s infinite alternate;">
                            SUMMONING FAILED
                        </h2>
                        <p style="color:var(--text); font-family:'Poppins'; margin-top:15px; font-size:14px; opacity:0.8;">
                           ANIME LIST DOES NOT HAVE ${q}
                        </p>
                        <div class="loader-container" style="position: static; display: block; margin: 30px auto;">
                            <div class="spinner" style="width: 40px; height: 40px; border-width: 4px; border-top-color: var(--accent);"></div>
                        </div>
                        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:40px 10%; width: 80%;">
                    </div>
                `;
                        
                render(animeList, false); 
            }
        } catch (e) {
            console.error("Search failed:", e);
        } finally {
            if(loader) loader.style.display = "none";
        }
    }, 600);
};


        
document.getElementById("clear-search").onmousedown = (e) => {
            
            
    e.preventDefault(); 
    
            
    search.value = ""; 
    document.getElementById("clear-search").style.display = "none";
    
            
    search.focus(); 
    
            
    resetToMainView();
};
        
function resetToMainView() {
    searching = false;
    if(document.getElementById("genre-list")) document.getElementById("genre-list").style.display = "flex"; 
    document.getElementById("trending-section").style.display = "block";
    
            
    document.getElementById("main-title").innerHTML = "⭐ Top Rated Anime";
    
    render(animeList, true);

    setTimeout(() => {
        window.scrollTo({top: searchStartPos, behavior: "smooth"});
    }, 100);
}

        
let scrollTimer; 

        
async function setupData() {
            
            
            
    const gRes = await fetch("https://api.jikan.moe/v4/genres/anime");
    const gData = await gRes.json();
    const gList = document.getElementById("genre-list");

    if(gList) {
        gList.innerHTML = '<button class="genre-pill active" id="genre-0" onclick="filterByGenre(0, this)">All</button>';
        
                 
        const excludedGenres = ["Boys Love", "Crossdressing", "Girls Love", "Hentai", "Ecchi", "Harem", "Erotica"];

        gData.data
            .filter(g => !excludedGenres.map(e => e.toLowerCase()).includes(g.name.toLowerCase()))
            .slice(0, 30) 
            .forEach(g => {
                const btn = document.createElement("button"); 
                btn.className = "genre-pill"; 
                btn.id = `genre-${g.mal_id}`;
                btn.innerText = g.name; 
                btn.onclick = () => filterByGenre(g.mal_id, btn);
                gList.appendChild(btn);
            });

                 
        const savedData = sessionStorage.getItem("animeScopeState");
        if (savedData) {
            const s = JSON.parse(savedData);
            if (s.genreScrollPos) {
                gList.scrollLeft = s.genreScrollPos;
            }
        }
    }

             
             
             
    try {
        const tRes = await fetch("https://api.jikan.moe/v4/top/anime?limit=22&filter=airing");
        
        if (!tRes.ok) {
            console.warn("MAINFRAME WARNING: Jikan API rate limit hit on trending slider.");
            return; 
        }

        const tData = await tRes.json();
        const slider = document.getElementById("trending-slider");
        
        if(slider && tData && tData.data) {
            slider.innerHTML = "";

                      
            const adultGenres = ["boys love", "crossdressing", "girls love", "hentai", "ecchi", "erotica", "harem"];

            const safeTrending = tData.data.filter(anime => {
                const allGenres = [
                    ...(anime.genres || []),
                    ...(anime.explicit_genres || []),
                    ...(anime.themes || [])
                ].map(g => g.name.toLowerCase());

                return !allGenres.some(name => adultGenres.includes(name));
            });

                      
            safeTrending.forEach(a => {
                const d = document.createElement("div"); 
                d.className="trending-card";
                d.innerHTML=`<a href="anime.html?id=${a.mal_id}" onclick="saveState()"><img src="${a.images.jpg.image_url}"></a>`;
                slider.appendChild(d);
            });

           const savedData = sessionStorage.getItem("animeScopeState");
           if (savedData) {
               const s = JSON.parse(savedData);
               if (s.sliderPos) slider.scrollLeft = s.sliderPos;
           }
           initAutoScroll();
        }
    } catch (e) {
        console.error("Trending slider failed to load:", e);
    }
}
          
function initAutoScroll() {
    const s = document.getElementById("trending-slider");
    if (!s) return;
    
    clearInterval(scrollTimer);           
 
 
    scrollTimer = setInterval(() => {
    const max = s.scrollWidth - s.clientWidth;

    if (s.scrollLeft >= max - 10) {
        s.scrollTo({ left: 0, behavior: 'smooth' }); 
    } else {
        s.scrollBy({ left: scrollStep, behavior: 'smooth' });           
    }
}, 4000);

              
    s.onmouseenter = () => clearInterval(scrollTimer);
    s.onmouseleave = () => initAutoScroll();
}

          
window.onload = async () => {
              
              
    const perfEntries = performance.getEntriesByType("navigation");
    if (perfEntries.length > 0 && perfEntries[0].type === "reload") {
        console.log("Hard Reset Triggered: Clearing temporary UI memory.");
        sessionStorage.removeItem("animeScopeState");
    }

              
    if (localStorage.getItem("animeTheme") === "light") {
        document.body.classList.add("light-theme");
        const t = document.getElementById("toggle");
        if(t) t.checked = false;
    }
    
    checkAuth();           
    await setupData();           

    const savedData = sessionStorage.getItem("animeScopeState");
    
    if (savedData) {
        try {
            const s = JSON.parse(savedData);
            
                      
            animeList = s.animeList || [];
            page = s.page || 1;
            currentGenreId = s.currentGenreId || 0;
            searching = s.isSearching || false;
            searchStartPos = s.searchStartPos || 0;
            
                      
            document.querySelectorAll(".genre-pill").forEach(p => p.classList.remove("active"));
            const activePill = document.getElementById(`genre-${currentGenreId}`);
            if(activePill) activePill.classList.add("active");

          if (searching && s.searchQuery) {
                search.value = s.searchQuery;
                document.getElementById("trending-section").style.display = "none";
                document.getElementById("genre-list").style.display = "none";
                
                const res = await fetch(`https://api.jikan.moe/v4/anime?q=${s.searchQuery}&order_by=score&sort=desc`);
                const d = await res.json();
                render(d.data, true);
            } else {
                          
                const trending = document.getElementById("trending-section");
                if (trending) {
                    trending.style.display = (s.currentGenreId === 0) ? "block" : "none";
                }
                
                document.getElementById("genre-list").style.display = "flex";
                
                if (animeList.length > 0) {
                    render(animeList, true);
                } else {
                    getAnime();
                }
            }

                      
            setTimeout(() => {
                window.scrollTo({ top: s.scrollPos, behavior: 'instant' });
            }, 200);

        } catch (err) {
            getAnime();           
        }
    } else {
                  
        getAnime();
    }
};

function filterByGenre(id, el) {
    document.querySelectorAll(".genre-pill").forEach(p => p.classList.remove("active")); 
    el.classList.add("active");
     const trending = document.getElementById("trending-section");
    if (trending) {
        trending.style.display = (id === 0) ? "block" : "none";
    }

    currentGenreId = id; 
    page = 1; 
    animeList = []; 
    seenIds.clear(); 
    searching = false; 
    getAnime(true);
}

function slideLeft() { 
    slider.scrollBy({left: -330, behavior: 'smooth'}); 
    initAutoScroll();           
}
function slideRight() { 
    slider.scrollBy({left: 330, behavior: 'smooth'}); 
    initAutoScroll();           
}

window.onscroll = () => {
    const btt = document.getElementById("backToTop");
    if(btt) btt.style.display = window.scrollY > 500 ? "block" : "none";
    if (!searching && !loading && (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 900) getAnime();
};

const bttBtn = document.getElementById("backToTop");
if(bttBtn) bttBtn.onclick = () => window.scrollTo({top: 0, behavior: 'smooth'});

async function toggleCompleted(id, el) {
    const user = localStorage.getItem("currentUser");
    if (!user) { alert("⚠ Please login first!"); return; }

    const fullAnime = animeList.find(a => a.mal_id === id);
    if (!fullAnime) return;

    const isRemoving = el.classList.contains("complete-active");

    
    if (isRemoving) {
        el.classList.remove("complete-active", "remove-action");
        el.classList.add("add-action");
    } else {
        el.classList.add("complete-active", "remove-action");
        el.classList.remove("add-action");
    }


    try {
        const response = await fetch('https://anime-scope-basecode.onrender.com/api/users/toggle-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: user,
                listType: 'completed', 
                anime: fullAnime,
                action: isRemoving ? 'remove' : 'add'
            })
        });
        const serverReply = await response.json();
        console.log("COMPLETED STATUS:", response.status, serverReply);
    } catch (error) {
        console.error("Database sync failed:", error);
    }

    
    let done = JSON.parse(localStorage.getItem("completed_" + user)) || [];
    if (isRemoving) {
        done = done.filter(item => (item.mal_id || item) !== id);
    } else {
        done.push(fullAnime);
    }
    localStorage.setItem("completed_" + user, JSON.stringify(done));
}
async function toggleFavorite(id, btn) {
    const user = localStorage.getItem("currentUser");
    if (!user) { alert("⚠ Please login first!"); return; }

    const fullAnime = animeList.find(a => a.mal_id === id);
    if (!fullAnime) return;

    const isRemoving = btn.classList.contains("fav-active");

   
    if (isRemoving) {
        btn.classList.remove("fav-active", "remove-action");
        btn.classList.add("add-action");
    } else {
        btn.classList.add("fav-active", "remove-action");
        btn.classList.remove("add-action");
    }

    
   try {
       
        const response = await fetch('https://anime-scope-basecode.onrender.com/api/users/toggle-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: user,
                listType: 'favourites', 
                anime: fullAnime,
                action: isRemoving ? 'remove' : 'add'
            })
        });

        
        const serverReply = await response.json();
        console.log("STATUS CODE:", response.status);
        console.log("SERVER MESSAGE:", serverReply);

    } catch (error) {
        console.error("Database sync failed:", error);
    }
    
    let fav = JSON.parse(localStorage.getItem("favorites_" + user)) || [];
    if (isRemoving) {
        
        fav = fav.filter(item => (item.mal_id || item) !== id);
    } else {
       
        fav.push(fullAnime);
    }
    localStorage.setItem("favorites_" + user, JSON.stringify(fav));
    
}

async function toggleWatch(id, el) {
    const user = localStorage.getItem("currentUser");
    if (!user) { alert("⚠ Please login first!"); return; }

    const fullAnime = animeList.find(a => a.mal_id === id);
    if (!fullAnime) return;

    const isRemoving = el.classList.contains("watch-active");

  
    if (isRemoving) {
        el.classList.remove("watch-active", "remove-action");
        el.classList.add("add-action");
    } else {
        el.classList.add("watch-active", "remove-action");
        el.classList.remove("add-action");
    }

    
    try {
        const response = await fetch('https://anime-scope-basecode.onrender.com/api/users/toggle-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: user,
                listType: 'watchLater', 
                anime: fullAnime,
                action: isRemoving ? 'remove' : 'add'
            })
        });
        const serverReply = await response.json();
        console.log("WATCH LATER STATUS:", response.status, serverReply);
    } catch (error) {
        console.error("Database sync failed:", error);
    }

   
    let watch = JSON.parse(localStorage.getItem("watchlist_" + user)) || [];
    if (isRemoving) {
        watch = watch.filter(item => (item.mal_id || item) !== id);
    } else {
        watch.push(fullAnime);
    }
    localStorage.setItem("watchlist_" + user, JSON.stringify(watch));
}

async function saveCommentToDB(animeId, text) {
    const user = localStorage.getItem("currentUser");
    if (!user) return;

    try {
        await fetch('https://anime-scope-basecode.onrender.com/api/users/add-comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, animeId: String(animeId), text: text })
        });
        console.log("Comment saved to DB!");
    } catch (error) {
        console.error("Failed to save comment:", error);
    }
}


async function saveRatingToDB(animeId, score) {
    const user = localStorage.getItem("currentUser");
    if (!user) return;

    try {
        await fetch('https://anime-scope-basecode.onrender.com/api/users/submit-rating', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, animeId: String(animeId), score: Number(score) })
        });
        console.log("Rating saved to DB!");
    } catch (error) {
        console.error("Failed to save rating:", error);
    }
}
   
function getRatingClass(score){
    if(!score) return "rating-low";
    if(score >= 8) return "rating-best";
    else if(score >= 5) return "rating-good";
    else return "rating-low";
}


    



