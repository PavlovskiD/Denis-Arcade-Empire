import { useEffect, useState } from "react";

import Heading from "./header";
import Dirt from "./dirt";
import Mole from "./mole";

import "./body.css";
import submitScore from "../../SubmitScore";

function WhackAMole() {
  screen.orientation.lock("portrait");

  let [dificulty, setDificulty] = useState(1);
  let [holesNumber, setHolesNumber] = useState(
    new Array(dificulty * 3).fill(1)
  );
  let [timeLeft, setTimeLeft] = useState(0);
  let [score, setScore] = useState(0);

  let [gameStart, setGameStart] = useState(false);

  let [molesShowTime, setMolesShowTime] = useState({});
  let [currentHole, setCurrentHole] = useState();
  let [lastHoleIdx, setLastHoleIdx] = useState();
  let [totalMolesUp, setTotalMolesUp] = useState(0);

  let [intervalID, setIntervalID] = useState();

  let [isMusicPlaying, setIsMusicPlaying] = useState(false);

  let startingTime = 30;

  const boing = document.getElementById("boing");
  const bgmusic = document.getElementById("bgmusic");

  useEffect(() => {
    let number = new Array(12).fill(1);
    setHolesNumber(number);
    let tmin;
    let tmax;
    if (dificulty == 1) {
      tmin = 1000;
      tmax = 1000;
    } else if (dificulty == 2) {
      tmin = 700;
      tmax = 700;
    } else if (dificulty == 3) {
      tmin = 500;
      tmax = 500;
    } else if (dificulty == 4) {
      tmin = 200;
      tmax = 200;
    }

    let moleTime = randomTime(tmin, tmax);
    setMolesShowTime(moleTime);
  }, [dificulty]);

  useEffect(() => {
    if (gameStart === true) {
      console.log("game starting");
      setTimeLeft(startingTime);
      setTotalMolesUp(0);
      setScore(0);
      setCurrentHole(0);
      playing();
      bgmusic.currentTime = 0.0001;
      setIsMusicPlaying(true);
      bgmusic.volume = 0.2;
      bgmusic.play();
    } else {
      submitScore(score);
      setGameStart(false);
      console.log("game ended");
      clearInterval(intervalID);

      if (isMusicPlaying) {
        bgmusic.pause();
        bgmusic.currentTime = 0;
        setIsMusicPlaying(false);
      }
    }
  }, [gameStart]);

  useEffect(() => {
    setTimeout(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
      } else {
        setGameStart(false);
      }
    }, 1000);
  }, [timeLeft]);

  useEffect(() => {
    console.log("mole Wacked!!");
  }, [score]);

  function playing() {
    let molesCount = 0;
    let tmpscore = 0;

    const iID = setInterval(() => {
      let holeIdx = selectRandomMole(holesNumber);
      const dmole = document.querySelector(`img[molenumber="${holeIdx}"]`);
      const activeMole = document.querySelector(`div[molenumber="${holeIdx}"]`);
      showMole(dmole, molesShowTime);
      molesCount++;
      setTotalMolesUp(molesCount);

      let isMoleWaked = false;
      const handleWack = (e) => {
        isMoleWaked = true;
        tmpscore++;
        setScore(tmpscore);
        activeMole.removeEventListener("click", handleWack);
        toggleRubberBand(dmole);
        boing.currentTime = 0.001;
        boing.play();
      };

      activeMole.addEventListener("click", handleWack);
      //listener for the active mole

      setTimeout(() => {
        hideMole(dmole);
      }, molesShowTime);

      setTimeout(() => {
        activeMole.removeEventListener("click", handleWack);
      }, molesShowTime * 2);
    }, molesShowTime);

    setIntervalID(iID);
  }

  function selectRandomMole(holesNumber) {
    //this selects a random mole and returns it
    const holeIdx = Math.floor(Math.random() * holesNumber.length);
    setCurrentHole(holeIdx);

    if (holeIdx === lastHoleIdx) {
      console.log("Es el mismo hoyo, vuelvo a llamar a la funcion");
      return selectRandomMole(holesNumber);
    }
    setLastHoleIdx(holeIdx);
    return holeIdx; // this is the number of the mole that is active
  }

  function showMole(dmole, moleTime) {
    dmole.style.transition = `transform ${moleTime / 1000}s ease-in-out`;
    dmole.classList.add("mole-up");
  }

  function hideMole(dmole) {
    dmole.classList.remove("mole-up");
  }

  function randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }

  // dmole.addEventListener("animationend", hideMole(dmole))

  function toggleRubberBand(dmole) {
    dmole.classList.add("bouncing");
    dmole.addEventListener("transitionend", () => {
      dmole.classList.remove("bouncing");
    });
  }

  return (
    <div className="App1">
      <section className="heading1">
        <Heading
          score={score}
          totalMolesUp={totalMolesUp}
          setDificulty={setDificulty}
          setGameStart={setGameStart}
          timeLeft={timeLeft}
        />
      </section>

      <section className="body1">
        <div className="grid-container1">
          {holesNumber?.map((mole, idx) => (
            <div key={`hole ${idx}`} className="grid-item1">
              <div molenumber={idx} className="father">
                <Dirt />
                <Mole idx={idx} score={score} setScore={setScore} />
              </div>
            </div>
          ))}
        </div>
        <audio id="boing" src="./boing.mp3"></audio>
        <audio id="bgmusic" src="./bgmusic.mp3"></audio>
      </section>
    </div>
  );
}

export default WhackAMole;
