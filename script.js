console.log("Let's write JavaScript");

let currentSong = new Audio();
let songs;
let currFolder;

function secToMinSec(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    if (remainingSeconds < 10) {
        remainingSeconds = "0" + remainingSeconds;
    }

    return `${minutes}:${remainingSeconds}`;
}

async function getSongs(folder) {

    currFolder = folder;
    let a = await fetch(`/SpotifyClone/Songs/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");

    songs = [];

    for (let index = 0; index < as.length; index++) {

        const element = as[index];

        if (element.innerText.endsWith(".mp3")) {

            songs.push(
                `/SpotifyClone/Songs/${folder}/${element.innerText}`
            );
        }
    }

    // Show all song in the playlist 
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        let songName = song.split("/").pop().replace(".mp3", "");
        songUL.innerHTML = songUL.innerHTML + `<li>
                                    
                                <img class="invert" src="Assests/music.svg" alt="">
                <div class="info">
                  <div>${songName}</div>
                  <div>Emaad</div>
                </div>

                <div class="playnow">
                  <span>Play Now</span>
                  <img class="invert" src="Assests/play.svg" alt="">
                </div>
                </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e)=> {
        e.addEventListener("click", function(ele) {

            playMusic(e.querySelector(".info").firstElementChild.innerHTML);

        })
    })

    return songs;
}

const playMusic = (track, pause=false)=> {
    // let audio = new Audio("/SpotifyClone/Songs/" + track + ".mp3");
    currentSong.src = `/SpotifyClone/Songs/${currFolder}/${track}.mp3`;
    if(!pause) {
        currentSong.play();
    }
    play.src = "Assests/pause.svg";

    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch(`/SpotifyClone/Songs/`);
    let response = await a.text();


    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");

    let cardContainer = document.querySelector(".cardContainer");
    // cardContainer.innerHTML = "";
    let array = Array.from(anchors);

    for(let index = 0; index < array.length; index++) {
        const e = array[index];
    
        if (e.innerText != "../") {
            let folder = e.innerText.replace("/", "");

            // Get the metadata of the folder
            let a = await fetch(`/SpotifyClone/Songs/${folder}/info.json`);
            let response = await a.json();
            // console.log(response.title, response.description);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}"class="card">
              <div class="play">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="32"
                  height="32"
                >
                  <circle cx="12" cy="12" r="11" fill="#1DB954"></circle>
                  <path
                    d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                    fill="#000000"
                  ></path>
                </svg>
              </div>
              <img
                src="/SpotifyClone/Songs/${folder}/cover.jpg"
                alt=""
              />
              <h3>${response.title}</h3>
              <p>${response.description}</p>
            </div>`
        }
    }

    // Load the playlist whenever the card is clicked
    Array.from(document.querySelectorAll(".card")).forEach((e)=> {
        e.addEventListener("click", async (item)=> {
            songs = await getSongs(`${item.currentTarget.dataset.folder}`);
            playMusic(songs[0].split("/").pop().replace(".mp3", ""));
        });
    });
}

async function main() {

    // Get the list of all songs
    await getSongs("ArijitSingh");
    playMusic(songs[0].split("/").pop().replace(".mp3", ""), true);
    
    // Display all the songs in the playlist
    await displayAlbums();


    // Attach an event listener to play button;
    const play = document.querySelector("#play");
    play.addEventListener("click", function() {
        if(currentSong.paused) {
            currentSong.play();
            play.src = "Assests/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "Assests/play.svg";
        }
    });

    // Add an event listener for previous button
    const prev = document.querySelector("#previous");
    prev.addEventListener("click", ()=> {
        let idx = songs.indexOf(`/SpotifyClone/Songs/${currFolder}/` + currentSong.src.split("/").pop());
        if(idx-1 >= 0) {
            playMusic(songs[idx-1].split("/").pop().replace(".mp3", ""));
        }
    });
    
    // Add an event listener for next button
    const next = document.querySelector("#next");
    next.addEventListener("click", ()=> {
        let idx = songs.indexOf(`/SpotifyClone/Songs/${currFolder}/` + currentSong.src.split("/").pop());
        if(idx+1 < songs.length) {
            playMusic(songs[idx+1].split("/").pop().replace(".mp3", ""));
        }
    });


    currentSong.addEventListener("loadedmetadata", () => {
        document.querySelector(".songtime").innerHTML =
            `00:00 / ${secToMinSec(currentSong.duration)}`;
    });

    // Listen for time update event
    currentSong.addEventListener("timeupdate", ()=> {
        document.querySelector(".songtime").innerHTML = `${secToMinSec(currentSong.currentTime)} / ${secToMinSec(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e)=> {
        const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });


    // Add an event listener for hamburger menu
    document.querySelector(".hamburger").addEventListener("click", ()=> {
        document.querySelector(".left").style.left = "0";
    });

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", ()=> {
        document.querySelector(".left").style.left = "-100%";
    });


    // Add an event listener for volume button
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e)=> {
        currentSong.volume = e.target.value / 100;
    });

    // Add evenet listener to mute the track
    document.querySelector(".volume > img").addEventListener("click", (e)=> {
        if(e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = .1;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10;
        }
    });

}

main();