import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  BALL_SIZE,
  BALL_BASE_SPEED,
  BALL_SPEED_INCREMENT,
  BUTTON_BG,
  CATCH_LINE,
  FIELD_GREEN,
  FIELD_LIGHT,
  GAME_DURATION_SEC,
  GLOVE_H,
  GLOVE_W,
  GLOVE_Y,
  LOGICAL_H,
  LOGICAL_W,
  MISS_LINE,
} from './constants';

const BALL_IMAGE = require('../../assets/ball.png');
const GLOVE_IMAGE = require('../../assets/glove.png');

type Props = {
  sessionKey: number;
  onGameOver: (score: number) => void;
};

type ArenaProps = {
  sessionKey: number;
  scale: number;
  boardW: number;
  boardH: number;
  onScoreChange: (score: number) => void;
  onTimeChange: (timeLeft: number) => void;
  onGameOver: (score: number) => void;
  onReady: (endGame: () => void) => void;
};

function resetBall(ballX: { current: number }, ballY: { current: number }) {
  ballX.current = Math.random() * 360;
  ballY.current = 0;
}

function clampGloveX(logicalX: number) {
  return Math.max(0, Math.min(LOGICAL_W - GLOVE_W, logicalX - 40));
}

const GameArena = memo(function GameArena({
  sessionKey,
  scale,
  boardW,
  boardH,
  onScoreChange,
  onTimeChange,
  onGameOver,
  onReady,
}: ArenaProps) {
  const gloveX = useRef(170);
  const ballX = useRef(200);
  const ballY = useRef(0);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(GAME_DURATION_SEC);
  const runningRef = useRef(false);
  const endedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scaleRef = useRef(scale);
  const boardLeftRef = useRef(0);

  const ballXAnim = useRef(new Animated.Value(200 * scale)).current;
  const ballYAnim = useRef(new Animated.Value(0)).current;
  const gloveXAnim = useRef(new Animated.Value(170 * scale)).current;

  useEffect(() => {
    scaleRef.current = scale;
    ballXAnim.setValue(ballX.current * scale);
    ballYAnim.setValue(ballY.current * scale);
    gloveXAnim.setValue(gloveX.current * scale);
  }, [scale, ballXAnim, ballYAnim, gloveXAnim]);

  const endGame = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    runningRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    onGameOver(scoreRef.current);
  }, [onGameOver]);

  useEffect(() => {
    onReady(endGame);
  }, [endGame, onReady]);

  const moveGloveToPageX = useCallback(
    (pageX: number) => {
      const boardX = pageX - boardLeftRef.current;
      const logicalX = boardX / scaleRef.current;
      gloveX.current = clampGloveX(logicalX);
      gloveXAnim.setValue(gloveX.current * scaleRef.current);
    },
    [gloveXAnim],
  );

  useEffect(() => {
    endedRef.current = false;
    runningRef.current = true;
    gloveX.current = 170;
    scoreRef.current = 0;
    timeLeftRef.current = GAME_DURATION_SEC;
    resetBall(ballX, ballY);
    onScoreChange(0);
    onTimeChange(GAME_DURATION_SEC);

    ballXAnim.setValue(ballX.current * scaleRef.current);
    ballYAnim.setValue(ballY.current * scaleRef.current);
    gloveXAnim.setValue(gloveX.current * scaleRef.current);

    timerRef.current = setInterval(() => {
      if (!runningRef.current || endedRef.current) return;
      timeLeftRef.current -= 1;
      onTimeChange(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        endGame();
      }
    }, 1000);

    let raf = 0;
    const loop = () => {
      if (!runningRef.current || endedRef.current) return;

      const elapsedTime = GAME_DURATION_SEC - timeLeftRef.current;
      ballY.current += BALL_BASE_SPEED + elapsedTime * BALL_SPEED_INCREMENT;

      if (
        ballY.current > CATCH_LINE &&
        ballX.current > gloveX.current &&
        ballX.current < gloveX.current + GLOVE_W
      ) {
        scoreRef.current += 1;
        onScoreChange(scoreRef.current);
        resetBall(ballX, ballY);
      } else if (ballY.current > MISS_LINE) {
        resetBall(ballX, ballY);
      }

      ballXAnim.setValue(ballX.current * scaleRef.current);
      ballYAnim.setValue(ballY.current * scaleRef.current);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      runningRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      cancelAnimationFrame(raf);
    };
  }, [
    sessionKey,
    endGame,
    ballXAnim,
    ballYAnim,
    gloveXAnim,
    onScoreChange,
    onTimeChange,
  ]);

  const boardRef = useRef<View>(null);

  const handleBoardLayout = useCallback(() => {
    boardRef.current?.measureInWindow((x) => {
      boardLeftRef.current = x;
    });
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          moveGloveToPageX(event.nativeEvent.pageX);
        },
        onPanResponderMove: (event) => {
          moveGloveToPageX(event.nativeEvent.pageX);
        },
      }),
    [moveGloveToPageX],
  );

  return (
    <View
      ref={boardRef}
      onLayout={handleBoardLayout}
      style={[styles.board, { width: boardW, height: boardH }]}
    >
      <View pointerEvents="none" style={styles.baseTint} />
      <View pointerEvents="none" style={[styles.skyStrip, { height: 120 * scale }]} />
      <View pointerEvents="none" style={styles.field} />

      <Animated.Image
        source={BALL_IMAGE}
        style={[
          styles.sprite,
          {
            width: BALL_SIZE * scale,
            height: BALL_SIZE * scale,
            transform: [
              { translateX: ballXAnim },
              { translateY: ballYAnim },
            ],
          },
        ]}
        resizeMode="contain"
      />
      <Animated.Image
        source={GLOVE_IMAGE}
        style={[
          styles.sprite,
          {
            width: GLOVE_W * scale,
            height: GLOVE_H * scale,
            transform: [
              { translateX: gloveXAnim },
              { translateY: GLOVE_Y * scale },
            ],
          },
        ]}
        resizeMode="contain"
      />

      <View
        style={styles.touchLayer}
        collapsable={false}
        {...panResponder.panHandlers}
      />
    </View>
  );
});

type HudProps = {
  score: number;
  timeLeft: number;
  scale: number;
};

const GameHud = memo(function GameHud({ score, timeLeft, scale }: HudProps) {
  return (
    <>
      <Text
        pointerEvents="none"
        style={[styles.hud, { fontSize: 14 * scale, left: 10 * scale, top: 8 * scale }]}
      >
        Score:{score}
      </Text>
      <Text
        pointerEvents="none"
        style={[
          styles.hud,
          {
            fontSize: 14 * scale,
            right: 10 * scale,
            top: 8 * scale,
          },
        ]}
      >
        Time:{timeLeft}
      </Text>
      <Text pointerEvents="none" style={[styles.hint, { fontSize: 11 * scale, bottom: 6 * scale }]}>
        손가락으로 좌우 이동
      </Text>
    </>
  );
});

export function GameBoard({ sessionKey, onGameOver }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const margin = 24;
  const boardW = Math.min(LOGICAL_W, windowWidth - margin * 2);
  const scale = boardW / LOGICAL_W;
  const boardH = LOGICAL_H * scale;

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SEC);
  const endGameRef = useRef<() => void>(() => {});

  const onScoreChange = useCallback((nextScore: number) => {
    setScore(nextScore);
  }, []);

  const onTimeChange = useCallback((nextTime: number) => {
    setTimeLeft(nextTime);
  }, []);

  const onReady = useCallback((endGame: () => void) => {
    endGameRef.current = endGame;
  }, []);

  return (
    <View style={styles.outer}>
      <View style={{ width: boardW, height: boardH, position: 'relative' }}>
        <GameArena
          sessionKey={sessionKey}
          scale={scale}
          boardW={boardW}
          boardH={boardH}
          onScoreChange={onScoreChange}
          onTimeChange={onTimeChange}
          onGameOver={onGameOver}
          onReady={onReady}
        />
        <GameHud score={score} timeLeft={timeLeft} scale={scale} />
      </View>

      <Pressable style={styles.abort} onPress={() => endGameRef.current()}>
        <Text style={styles.abortText}>종료</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  board: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  touchLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  baseTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: FIELD_GREEN,
    opacity: 0.18,
  },
  skyStrip: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(135, 206, 235, 0.48)',
  },
  field: {
    ...StyleSheet.absoluteFillObject,
    top: 120,
    backgroundColor: FIELD_LIGHT,
    opacity: 0.72,
  },
  sprite: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  hud: {
    position: 'absolute',
    color: '#fff',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  hint: {
    position: 'absolute',
    alignSelf: 'center',
    color: 'rgba(255,255,255,0.85)',
  },
  abort: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: BUTTON_BG,
    borderRadius: 24,
  },
  abortText: {
    color: '#fff',
    fontWeight: '600',
  },
});
