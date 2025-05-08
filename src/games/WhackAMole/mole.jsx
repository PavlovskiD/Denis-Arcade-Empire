import ImgMole from "./mole.svg";

const Mole = ({ idx }) => {
  return (
    <img molenumber={idx} className="mole" src={ImgMole} alt="Mole image" />
  );
};
export default Mole;
