import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BUTTON_BG } from './src/game/constants';
import { GameBoard } from './src/game/GameBoard';

type Screen = 'name' | 'game' | 'result' | 'reward' | 'sns';

export default function App() {
  const [screen, setScreen] = useState<Screen>('name');
  const [nickname, setNickname] = useState('');
  const [lastScore, setLastScore] = useState(0);
  const [gameSession, setGameSession] = useState(0);

  const go = useCallback((s: Screen) => setScreen(s), []);

  const saveName = useCallback(() => {
    setNickname((n) => (n.trim() ? n.trim() : '플레이어'));
    setGameSession((k) => k + 1);
    go('game');
  }, [go]);

  const handleGameOver = useCallback(
    (score: number) => {
      setLastScore(score);
      go('result');
    },
    [go],
  );

  const resetFlow = useCallback(() => {
    setNickname('');
    setLastScore(0);
    go('name');
  }, [go]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />
        <View style={styles.root}>
          {screen === 'name' && (
            <View style={styles.center}>
              <Text style={styles.title}>Catch to Win</Text>
              <Text style={styles.sub}>닉네임만 입력하면 바로 시작합니다.</Text>
              <Text style={styles.heading}>닉네임 입력</Text>
              <TextInput
                style={styles.input}
                placeholder="닉네임"
                placeholderTextColor="#ccc"
                value={nickname}
                onChangeText={setNickname}
                maxLength={12}
              />
              <Pressable style={styles.btn} onPress={saveName}>
                <Text style={styles.btnText}>게임 시작</Text>
              </Pressable>
            </View>
          )}

          {screen === 'game' && (
            <GameBoard sessionKey={gameSession} onGameOver={handleGameOver} />
          )}

          {screen === 'result' && (
            <View style={styles.center}>
              <Text style={styles.resultText}>
                {(nickname.trim() || '플레이어') + '님 ' + lastScore + '개 성공!'}
              </Text>
              <Pressable style={styles.btn} onPress={() => go('reward')}>
                <Text style={styles.btnText}>리워드 받기</Text>
              </Pressable>
            </View>
          )}

          {screen === 'reward' && (
            <View style={styles.center}>
              <Text style={styles.heading}>리워드 획득!</Text>
              <Text style={styles.emoji}>🎁</Text>
              <Pressable style={styles.btn} onPress={() => go('sns')}>
                <Text style={styles.btnText}>다음</Text>
              </Pressable>
            </View>
          )}

          {screen === 'sns' && (
            <View style={styles.center}>
              <Text style={styles.heading}>공유하기</Text>
              <Text style={styles.sub}>스토어 배포 시 SNS 연동을 붙일 수 있어요.</Text>
              <Pressable style={styles.btn} onPress={resetFlow}>
                <Text style={styles.btnText}>처음으로</Text>
              </Pressable>
            </View>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f3d2e',
  },
  root: {
    flex: 1,
    width: '100%',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 28,
    textAlign: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    maxWidth: 280,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    color: '#fff',
    marginBottom: 20,
  },
  btn: {
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 30,
    backgroundColor: BUTTON_BG,
  },
  btnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  resultText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 28,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 24,
  },
});
