import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import {
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
  /** 부모에서 게임 재시작할 때마다 증가 */
  sessionKey: number;
  onGameOver: (score: number) => void;
};

function resetBall(ballX: { current: number }, ballY: { current: number }) {
  ballX.current = Math.random() * 360;
  ballY.current = 0;
}

export function GameBoard({ sessionKey, onGameOver }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const margin = 24;
  const boardW = Math.min(LOGICAL_W, windowWidth - margin * 2);
  const scale = boardW / LOGICAL_W;
  const boardH = LOGICAL_H * scale;

  const gloveX = useRef(170);
  const ballX = useRef(200);
  const ballY = useRef(0);
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(GAME_DURATION_SEC);
  const runningRef = useRef(false);
  const endedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [, tick] = useReducer((n) => n + 1, 0);

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
    endedRef.current = false;
    runningRef.current = true;
    gloveX.current = 170;
    scoreRef.current = 0;
    timeLeftRef.current = GAME_DURATION_SEC;
    resetBall(ballX, ballY);

    timerRef.current = setInterval(() => {
      if (!runningRef.current || endedRef.current) return;
      timeLeftRef.current -= 1;
      tick();
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
        resetBall(ballX, ballY);
      } else if (ballY.current > MISS_LINE) {
        resetBall(ballX, ballY);
      }

      tick();
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
  }, [sessionKey, endGame]);

  const onTouch = useCallback(
    (locationX: number) => {
      const logicalX = locationX / scale;
      gloveX.current = Math.max(
        0,
        Math.min(LOGICAL_W - GLOVE_W, logicalX - 40),
      );
      tick();
    },
    [scale],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: (event) => {
          onTouch(event.nativeEvent.locationX);
        },
        onPanResponderMove: (event) => {
          onTouch(event.nativeEvent.locationX);
        },
      }),
    [onTouch],
  );

  return (
    <View style={styles.outer}>
      <View style={[styles.board, { width: boardW, height: boardH }]} {...panResponder.panHandlers}>
        <View pointerEvents="none" style={styles.baseTint} />
        <View pointerEvents="none" style={[styles.skyStrip, { height: 120 * scale }]} />
        <View pointerEvents="none" style={styles.field} />

        <Image
          source={BALL_IMAGE}
          style={[
            styles.sprite,
            {
              width: BALL_SIZE * scale,
              height: BALL_SIZE * scale,
              left: ballX.current * scale,
              top: ballY.current * scale,
            },
          ]}
          resizeMode="contain"
        />
        <Image
          source={GLOVE_IMAGE}
          style={[
            styles.sprite,
            {
              width: GLOVE_W * scale,
              height: GLOVE_H * scale,
              left: gloveX.current * scale,
              top: GLOVE_Y * scale,
            },
          ]}
          resizeMode="contain"
        />

        <Text
          pointerEvents="none"
          style={[styles.hud, { fontSize: 14 * scale, left: 10 * scale, top: 8 * scale }]}
        >
          Score:{scoreRef.current}
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
          Time:{timeLeftRef.current}
        </Text>

        <Text pointerEvents="none" style={[styles.hint, { fontSize: 11 * scale, bottom: 6 * scale }]}>
          손가락으로 좌우 이동
        </Text>
      </View>

      <Pressable style={styles.abort} onPress={endGame}>
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
