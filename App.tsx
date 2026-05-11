import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BUTTON_BG, KBO_TEAMS, type KboTeam } from './src/game/constants';
import { GameBoard } from './src/game/GameBoard';

type Screen =
  | 'login'
  | 'name'
  | 'team'
  | 'start'
  | 'game'
  | 'result'
  | 'reward'
  | 'sns';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [nickname, setNickname] = useState('');
  const [team, setTeam] = useState<KboTeam | ''>('');
  const [lastScore, setLastScore] = useState(0);
  const [gameSession, setGameSession] = useState(0);

  const go = useCallback((s: Screen) => setScreen(s), []);

  const saveName = useCallback(() => {
    setNickname((n) => (n.trim() ? n.trim() : '플레이어'));
    go('team');
  }, [go]);

  const selectTeam = useCallback(
    (t: KboTeam) => {
      setTeam(t);
      go('start');
    },
    [go],
  );

  const startGame = useCallback(() => {
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
    setTeam('');
    setLastScore(0);
    go('login');
  }, [go]);

  const teamRows = useMemo(() => {
    const rows: KboTeam[][] = [
      [KBO_TEAMS[0], KBO_TEAMS[1], KBO_TEAMS[2]],
      [KBO_TEAMS[3], KBO_TEAMS[4], KBO_TEAMS[5]],
      [KBO_TEAMS[6], KBO_TEAMS[7], KBO_TEAMS[8]],
      [KBO_TEAMS[9]],
    ];
    return rows;
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />
        <View style={styles.root}>
          {screen === 'login' && (
            <View style={styles.center}>
              <Text style={styles.title}>Catch to Win</Text>
              <Text style={styles.sub}>간편 시작 (데모)</Text>
              <Pressable style={styles.oauth} onPress={() => go('name')}>
                <Text style={styles.oauthText}>Google로 계속</Text>
              </Pressable>
              <Pressable style={styles.oauth} onPress={() => go('name')}>
                <Text style={styles.oauthText}>Apple로 계속</Text>
              </Pressable>
            </View>
          )}

          {screen === 'name' && (
            <View style={styles.center}>
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
                <Text style={styles.btnText}>확인</Text>
              </Pressable>
            </View>
          )}

          {screen === 'team' && (
            <ScrollView
              contentContainerStyle={styles.teamScroll}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.heading}>응원 팀 선택</Text>
              {teamRows.map((row, i) => (
                <View key={i} style={styles.teamRow}>
                  {row.map((t) => (
                    <Pressable
                      key={t}
                      style={[styles.teamBtn, row.length === 1 && styles.teamBtnSingle]}
                      onPress={() => selectTeam(t)}
                    >
                      <Text style={styles.teamBtnText}>{t}</Text>
                    </Pressable>
                  ))}
                </View>
              ))}
            </ScrollView>
          )}

          {screen === 'start' && (
            <View style={styles.center}>
              <Text style={styles.heading}>START</Text>
              <Text style={styles.teamPill}>{team}</Text>
              <Pressable style={styles.btn} onPress={startGame}>
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
  oauth: {
    width: '100%',
    maxWidth: 280,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: '#fff',
    marginBottom: 12,
    alignItems: 'center',
  },
  oauthText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
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
  teamScroll: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  teamRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  teamBtn: {
    minWidth: 92,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 30,
    backgroundColor: BUTTON_BG,
  },
  teamBtnSingle: {
    minWidth: 120,
  },
  teamBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  teamPill: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginBottom: 24,
    fontWeight: '600',
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
