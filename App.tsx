import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Image, ImageBackground, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  BUTTON_BG,
  REWARD_SCORE_THRESHOLD,
  type KboTeam,
} from './src/game/constants';
import { GameBoard } from './src/game/GameBoard';

type Screen = 'name' | 'team' | 'game' | 'reward' | 'retry';

const TEAM_OPTIONS: Array<{ key: KboTeam; image: number }> = [
  { key: 'LG', image: require('./assets/team/LG.png') },
  { key: '두산', image: require('./assets/team/DOOSAN.png') },
  { key: 'SSG', image: require('./assets/team/SSG.png') },
  { key: '키움', image: require('./assets/team/KIWOOM.png') },
  { key: 'KIA', image: require('./assets/team/KIA.png') },
  { key: 'KT', image: require('./assets/team/KT.png') },
  { key: '롯데', image: require('./assets/team/LOTTE.jpg') },
  { key: '삼성', image: require('./assets/team/SAMSUNG.png') },
  { key: '한화', image: require('./assets/team/EAGLES.png') },
  { key: 'NC', image: require('./assets/team/NC.png') },
];
const BACKGROUND_IMAGE = require('./assets/background.jpeg');

export default function App() {
  const [screen, setScreen] = useState<Screen>('name');
  const [nickname, setNickname] = useState('');
  const [team, setTeam] = useState<KboTeam | null>(null);
  const [lastScore, setLastScore] = useState(0);
  const [gameSession, setGameSession] = useState(0);

  const go = useCallback((s: Screen) => setScreen(s), []);

  const saveName = useCallback(() => {
    setNickname((n) => (n.trim() ? n.trim() : '플레이어'));
    go('team');
  }, [go]);

  const selectTeam = useCallback(
    (selectedTeam: KboTeam) => {
      setTeam(selectedTeam);
      setGameSession((k) => k + 1);
      go('game');
    },
    [go],
  );

  const handleGameOver = useCallback(
    (score: number) => {
      setLastScore(score);
      go(score >= REWARD_SCORE_THRESHOLD ? 'reward' : 'retry');
    },
    [go],
  );

  const resetFlow = useCallback(() => {
    setNickname('');
    setTeam(null);
    setLastScore(0);
    go('name');
  }, [go]);

  const restartGame = useCallback(() => {
    setGameSession((k) => k + 1);
    go('game');
  }, [go]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />
        <ImageBackground source={BACKGROUND_IMAGE} style={styles.root} resizeMode="cover">
          <View style={styles.overlay}>
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

            {screen === 'team' && (
              <View style={styles.center}>
                <Text style={styles.heading}>응원 팀 선택</Text>
                <Text style={styles.sub}>팀 이미지를 눌러 바로 게임을 시작하세요.</Text>
                <View style={styles.teamGrid}>
                  {TEAM_OPTIONS.map((option) => (
                    <Pressable
                      key={option.key}
                      style={styles.teamCard}
                      onPress={() => selectTeam(option.key)}
                    >
                      <View style={styles.teamImageFrame}>
                        <Image source={option.image} style={styles.teamImage} resizeMode="contain" />
                      </View>
                      <Text style={styles.teamLabel}>{option.key}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {screen === 'game' && (
              <GameBoard sessionKey={gameSession} onGameOver={handleGameOver} />
            )}

            {screen === 'reward' && (
              <View style={styles.center}>
                <Text style={styles.heading}>리워드 획득!</Text>
                <Text style={styles.emoji}>🎁</Text>
                <Text style={styles.resultText}>
                  {(nickname.trim() || '플레이어') + '님 ' + lastScore + '개 성공!'}
                </Text>
                <Text style={styles.sub}>
                  {team ? `${team} 응원 미션 성공! ` : ''}
                  {REWARD_SCORE_THRESHOLD}점 이상 달성에 성공했어요.
                </Text>
                <Pressable style={styles.btn} onPress={resetFlow}>
                  <Text style={styles.btnText}>홈으로</Text>
                </Pressable>
              </View>
            )}

            {screen === 'retry' && (
              <View style={styles.center}>
                <Text style={styles.heading}>조금만 더!</Text>
                <Text style={styles.resultText}>
                  {(nickname.trim() || '플레이어') + '님 ' + lastScore + '개 성공!'}
                </Text>
                <Text style={styles.sub}>
                  {REWARD_SCORE_THRESHOLD}점 이상 달성하면 리워드를 받을 수 있어요.
                </Text>
                <Pressable style={styles.btn} onPress={restartGame}>
                  <Text style={styles.btnText}>다시 도전하기</Text>
                </Pressable>
              </View>
            )}
          </View>
        </ImageBackground>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },
  root: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
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
  teamGrid: {
    width: '100%',
    maxWidth: 280,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    rowGap: 14,
  },
  teamCard: {
    width: '50%',
    minWidth: 120,
    alignItems: 'center',
  },
  teamImageFrame: {
    width: '100%',
    aspectRatio: 2,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 8,
  },
  teamImage: {
    width: '100%',
    height: '100%',
  },
  teamLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
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
