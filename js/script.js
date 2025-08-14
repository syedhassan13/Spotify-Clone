let currentNaat = new Audio();
let naats;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getNaats(folder) {
  currFolder = folder;

  let a = await fetch(`${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  naats = [];
  for (let i = 0; i < as.length; i++) {
    //console.log(as[i]);
    const href = as[i].getAttribute("href"); // original attribute, not browser URL
    if (href && href.toLowerCase().endsWith(".mp3")) {
      // Extract only filename (handles \ and /)
      const fileName = href.split(/[/\\]/).pop();
      naats.push(fileName);
    }
  }

  //show all the naats in the playlist
  let naatUL = document
    .querySelector(".naatList")
    .getElementsByTagName("ul")[0];
  naatUL.innerHTML = "";
  for (const naat of naats) {
    naatUL.innerHTML += `<li>
                  <img class="invert" src="./img/music.svg"/>
                  <div class="info">
                    <div><span>${naat}</span></div>
                    <div><span>Hassan</span></div>
                  </div>
                  <div class="playnow">
                    <span>Play</span>
                    <img class="invert" src="./img/play.svg" />
                  </div>
                </li>`;
  }

  Array.from(
    document.querySelector(".naatList").getElementsByTagName("li")
  ).forEach((element) => {
    element.addEventListener("click", () => {
      console.log(
        element.querySelector(".info").firstElementChild.textContent.trim()
      );
      playNaat(
        element.querySelector(".info").firstElementChild.textContent.trim(),
        currFolder,
        false
      );
    });
  });

  return naats;
}
async function displayAlbums() {
  let a = await fetch(`Naats/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");

  let array = Array.from(as);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/Naats")) {
      let folder = e.href.split("/").slice(-2)[0];
      //meta data of the folder
      let a = await fetch(`Naats/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        ` <div data-folder="${folder}" class="card">
              <div class="play">
                <img src="./img/play.svg"/>
              </div>
              <img src="Naats/${folder}/cover.jpg" />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
    }
  }

  //Loading playlist whenever card is called
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      naats = await getNaats(`Naats/${item.currentTarget.dataset.folder}`);
      playNaat(naats[0]);
    });
  });
}
const playNaat = (naat, folder = currFolder, pause) => {
  //let audio = new Audio("/Naats Audios/" +naat)
  //audio.play();

  currentNaat.src = `${folder}/` + naat;

  if (!pause) {
    currentNaat.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".naatInfo").innerHTML = naat;
  document.querySelector(".naatTime").innerHTML = "00:00 / 00:00";
};

async function main() {
  //Get all the naats
  await getNaats("Naats/allah-tera-ehsan-noor-e-ramazan");

  playNaat(naats[0], currFolder, true);

  await displayAlbums();

  document.getElementById("play").addEventListener("click", () => {
    if (currentNaat.paused) {
      currentNaat.play();
      play.src = "img/pause.svg";
    } else {
      currentNaat.pause();
      play.src = "img/play.svg";
    }
  });

  //Listen for timeUpdate event

  currentNaat.addEventListener("timeupdate", () => {
    document.querySelector(".naatTime").innerHTML = `${secondsToMinutesSeconds(
      currentNaat.currentTime
    )} / 
    ${secondsToMinutesSeconds(currentNaat.duration)}`;

    document.querySelector(".circle").style.left =
      (currentNaat.currentTime / currentNaat.duration) * 100 + "%";
  });
  //Add an event listner to seekbar
  document.querySelector(".seekBar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentNaat.currentTime = (currentNaat.duration * percent) / 100;
  });
  //Adding event listner on hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  //Add event listner for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-200%";
  });
  //Add an eventlistner on prev and next
  previous.addEventListener("click", () => {
    console.log(currentNaat.src.split("/").slice(-1)[0]);
    let mp3List = naats.filter((n) => n.toLowerCase().endsWith(".mp3"));
    let index = mp3List.indexOf(currentNaat.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playNaat(naats[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    currentNaat.pause();
    console.log(currentNaat.src.split("/").slice(-1)[0]);
    let mp3List = naats.filter((n) => n.toLowerCase().endsWith(".mp3"));
    let index = mp3List.indexOf(currentNaat.src.split("/").slice(-1)[0]);
    if (index + 1 < naats.length) {
      playNaat(naats[index + 1]);
    }
  });

  //Add an event for volume
  document
    .querySelector(".volume")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentNaat.volume = parseInt(e.target.value) / 100;
      if (currentNaat.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("mute.svg", "volume.svg");
      }
       if (currentNaat.volume === 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("volume.svg", "mute.svg");
      }

    });

  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentNaat.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentNaat.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
