import styled from "styled-components";
import { useEffect, useState } from "react";
import submitScore from "../SubmitScore";
import supabase from "../supabase/supabaseClient";

const BIRD_HEIGHT = 28;
const BIRD_WIDTH = 33;
const WALL_HEIGHT = 600;
const WALL_WIDTH = 400;
const GRAVITY = 6;
const OBJ_WIDTH = 52;
const OBJ_SPEED = 6;
const OBJ_GAP = 200;

function FlappyBird() {
  const [isStart, setIsStart] = useState(false);
  const [birdpos, setBirspos] = useState(300);
  const [objHeight, setObjHeight] = useState(0);
  const [objPos, setObjPos] = useState(WALL_WIDTH);
  const [score, setScore] = useState(0);
  const [userName, setUserName] = useState("");
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const gameIdentifier = "flappybird";

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.username || "User");
      } else {
        window.location.href = "/login";
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("game", gameIdentifier) // Filter comments by game identifier
        .order("created_at", { ascending: true });

      if (!error) {
        setComments(data); // Store only comments for this game
      } else {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, []);

  useEffect(() => {
    let intVal;
    if (isStart && birdpos < WALL_HEIGHT - BIRD_HEIGHT) {
      intVal = setInterval(() => {
        setBirspos((birdpos) => birdpos + GRAVITY);
      }, 24);
    }
    return () => clearInterval(intVal);
  });

  useEffect(() => {
    let objval;
    if (isStart && objPos >= -OBJ_WIDTH) {
      objval = setInterval(() => {
        setObjPos((objPos) => objPos - OBJ_SPEED);
      }, 24);

      return () => {
        clearInterval(objval);
      };
    } else {
      setObjPos(WALL_WIDTH);
      setObjHeight(Math.floor(Math.random() * (WALL_HEIGHT - OBJ_GAP)));
      if (isStart) setScore((score) => score + 1);
    }
  }, [isStart, objPos]);

  useEffect(() => {
    let topObj = birdpos >= 0 && birdpos < objHeight;
    let bottomObj =
      birdpos <= WALL_HEIGHT &&
      birdpos >=
        WALL_HEIGHT - (WALL_HEIGHT - OBJ_GAP - objHeight) - BIRD_HEIGHT;

    if (
      objPos >= OBJ_WIDTH &&
      objPos <= OBJ_WIDTH + 80 &&
      (topObj || bottomObj)
    ) {
      submitScore(score);
      setIsStart(false);
      setBirspos(300);
      setScore(0);
    }
  }, [isStart, birdpos, objHeight, objPos]);

  const handler = () => {
    if (!isStart) setIsStart(true);
    else if (birdpos < BIRD_HEIGHT) setBirspos(0);
    else setBirspos((birdpos) => birdpos - 50);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (input.trim() === "") return;

    const { data, error } = await supabase
      .from("comments")
      .insert([{ username: userName, text: input, game: gameIdentifier }])
      .select(); // 👈 make sure to include .select() to get the inserted row back

    if (error) {
      alert("Error posting comment: " + error.message);
      return;
    }

    if (data && data.length > 0) {
      setComments((prev) => [...prev, data[0]]);
    }

    setInput(""); // Clear the input field
  };

  return (
    <Container>
      <GameSection onClick={handler}>
        <ScoreShow>
          <span>Score: {score}</span>
        </ScoreShow>
        <Background height={WALL_HEIGHT} width={WALL_WIDTH}>
          {!isStart ? <StartBoard>Click To Start</StartBoard> : null}
          <Obj
            height={objHeight}
            width={OBJ_WIDTH}
            left={objPos}
            top={0}
            deg={180}
          />
          <Bird
            height={BIRD_HEIGHT}
            width={BIRD_WIDTH}
            top={birdpos}
            left={100}
          />
          <Obj
            height={WALL_HEIGHT - OBJ_GAP - objHeight}
            width={OBJ_WIDTH}
            left={objPos}
            top={
              WALL_HEIGHT - (objHeight + (WALL_HEIGHT - OBJ_GAP - objHeight))
            }
            deg={0}
          />
        </Background>
      </GameSection>

      <CommentSection>
        <Header>
          <h3>Comments For Flappy Bird</h3>
        </Header>
        <CommentList>
          {comments.map((comment, index) => (
            <Comment key={index}>
              <strong>
                {comment.username}{" "}
                <TimeStyle>
                  {new Date(comment.created_at).toLocaleDateString()}
                </TimeStyle>
                :
              </strong>{" "}
              {comment.text}
            </Comment>
          ))}
        </CommentList>
        <form onSubmit={handleCommentSubmit}>
          <CommentInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Leave a comment..."
          />
          <SubmitButton type="submit">Post</SubmitButton>
        </form>
      </CommentSection>
    </Container>
  );
}

export default FlappyBird;

const Header = styled.div`
  font-family: felix;
`;

const Background = styled.div`
  background-image: url("./src/assets/background-day.png");
  background-repeat: no-repeat;
  background-size: ${(props) => props.width}px ${(props) => props.height}px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  position: relative;
  overflow: hidden;
  border: 5px solid black;
`;

const Bird = styled.div`
  position: absolute;
  background-image: url("./src/assets/yellowbird-upflap.png");
  background-repeat: no-repeat;
  background-size: ${(props) => props.width}px ${(props) => props.height}px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  top: ${(props) => props.top}px;
  left: ${(props) => props.left}px;
`;

const Obj = styled.div`
  position: relative;
  background-image: url("./src/assets/pipe-green.png");
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  left: ${(props) => props.left}px;
  top: ${(props) => props.top}px;
  transform: rotate(${(props) => props.deg}deg);
`;

const StartBoard = styled.div`
  position: relative;
  top: 49%;
  background-color: black;
  padding: 10px;
  width: 100px;
  left: 50%;
  margin-left: -50px;
  text-align: center;
  font-size: 20px;
  border-radius: 10px;
  color: #fff;
  font-weight: 600;
  font-family: ceaser;
  letter-spacing: 1px;
  cursor: pointer;
`;

const ScoreShow = styled.div`
  text-align: center;
  background: #f0e1ca;
  height: 35px;
  width: 80px;
  margin: 10px;
  margin-left: 170px;
  padding-top: 11px;
  font-family: ceaser;
  letter-spacing: 1px;
  border-radius: 8px;
`;
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
`;

const GameSection = styled.div`
  margin-right: 40px;
  margin-left: 250px;
  cursor: pointer;
`;

const CommentSection = styled.div`
  background: #ffffff;
  margin-top: 65px;
  padding: 30px;
  border: 2px solid #ccc;
  border-radius: 12px;
  width: 250px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
`;

const CommentList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 10px 0;
  font-family: felix;
  letter-spacing: 1.5px;
  max-height: 200px;
  overflow-y: auto;
  
`;

const Comment = styled.li`
  background: #f0e1ca;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 9px;
  font-size: 14px;
  
`;

const CommentInput = styled.input`
  width: calc(100% - 20px);
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-bottom: 10px;
  font-size: 14px;
`;

const SubmitButton = styled.button`
  padding: 8px 12px;
  background: #f8c471;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  &:hover {
    background: #f0b14a;
  }
`;

const TimeStyle = styled.a`
  color: gray;
  font-size: 0.85rem;
`;
