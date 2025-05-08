import "./header.css";
import ImgHero from "./background.png";

const Heading = ({
  score,
  totalMolesUp,
  setDificulty,
  setGameStart,
  timeLeft,
}) => {
  function handleStart() {
    setGameStart(true);
  }

  function handleChange(e) {
    setDificulty(e.target.value);
  }

  return (
    <div className="header2">
      <div className="header-left">
        <button className="startBtn1" id="start1" onClick={handleStart}>
          Start
        </button>
        <label className="lbl">Level</label>
        <select onChange={(e) => handleChange(e)}>
          <option value={1}>easy</option>
          <option value={2}>normal</option>
          <option value={3}>hard</option>
          <option value={4}>pro</option>
        </select>
      </div>

      <div className="header-center">
        <h1>WACK A MOLE</h1>
        <img src={ImgHero} alt="wack a mole game logo" />
      </div>

      <div className="header-right">
        <p>
          Score:{" "}
          <span>
            {score} / {totalMolesUp}
          </span>
        </p>
        <p>
          Time: <span>{timeLeft}</span> 
        </p>
      </div>
    </div>
  );
};

export default Heading;
