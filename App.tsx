import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  BUTTON_BG,
  BUTTON_TEXT,
  REWARD_SCORE_THRESHOLD,
  type KboTeam,
} from "./src/game/constants";
import { GameBoard } from "./src/game/GameBoard";
import { openRewardInBrowser } from "./src/reward/openRewardInBrowser";
import { appFont, fontAssets } from "./src/theme/fonts";

type Screen =
  | "name"
  | "team"
  | "landing"
  | "schedule"
  | "game"
  | "reward"
  | "retry";

const TEAM_OPTIONS: Array<{ key: KboTeam; image: number }> = [
  { key: "LG", image: require("./assets/team/LG.png") },
  { key: "두산", image: require("./assets/team/DOOSAN.png") },
  { key: "SSG", image: require("./assets/team/SSG.png") },
  { key: "키움", image: require("./assets/team/KIWOOM.png") },
  { key: "KIA", image: require("./assets/team/KIA.png") },
  { key: "KT", image: require("./assets/team/KT.png") },
  { key: "롯데", image: require("./assets/team/LOTTE.jpg") },
  { key: "삼성", image: require("./assets/team/SAMSUNG.png") },
  { key: "한화", image: require("./assets/team/EAGLES.png") },
  { key: "NC", image: require("./assets/team/NC.png") },
];
const BACKGROUND_IMAGE = require("./assets/background.jpeg");
const LOGO_IMAGE = require("./assets/logo.png");
const REWARD_IMAGE = require("./assets/reward.png");
const REWARD_IMAGE_WIDTH = 216;
const REWARD_IMAGE_HEIGHT = 270;
const REWARD_IMAGE_ASPECT_RATIO = REWARD_IMAGE_WIDTH / REWARD_IMAGE_HEIGHT;

const TEAM_SCHEDULE_IMAGES: Partial<Record<KboTeam, number>> = {
  LG: require("./assets/schedule/LG.png"),
  두산: require("./assets/schedule/DOOSAN.png"),
  SSG: require("./assets/schedule/SSG.png"),
  키움: require("./assets/schedule/KIWOOM.png"),
  KIA: require("./assets/schedule/KIA.png"),
  KT: require("./assets/schedule/KT.png"),
  롯데: require("./assets/schedule/LOTTE.png"),
  삼성: require("./assets/schedule/SAMSUNG.png"),
  한화: require("./assets/schedule/EAGLES.png"),
  NC: require("./assets/schedule/NC.png"),
};

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);
  const [screen, setScreen] = useState<Screen>("name");
  const [nickname, setNickname] = useState("");
  const [team, setTeam] = useState<KboTeam | null>(null);
  const [lastScore, setLastScore] = useState(0);
  const [gameSession, setGameSession] = useState(0);

  const go = useCallback((s: Screen) => setScreen(s), []);

  const saveName = useCallback(() => {
    setNickname((n) => (n.trim() ? n.trim() : "플레이어"));
    go("team");
  }, [go]);

  const selectTeam = useCallback(
    (selectedTeam: KboTeam) => {
      setTeam(selectedTeam);
      go("landing");
    },
    [go],
  );

  const handleGameOver = useCallback(
    (score: number) => {
      setLastScore(score);
      go(score >= REWARD_SCORE_THRESHOLD ? "reward" : "retry");
    },
    [go],
  );

  const resetFlow = useCallback(() => {
    setNickname("");
    setTeam(null);
    setLastScore(0);
    go("name");
  }, [go]);

  const goHome = useCallback(() => {
    setLastScore(0);
    go("landing");
  }, [go]);

  const restartGame = useCallback(() => {
    setGameSession((k) => k + 1);
    go("game");
  }, [go]);

  const startGame = useCallback(() => {
    setGameSession((k) => k + 1);
    go("game");
  }, [go]);

  const downloadRewardImage = useCallback(async () => {
    try {
      await openRewardInBrowser();
    } catch {
      Alert.alert(
        "열기 실패",
        "리워드 이미지 페이지를 열지 못했습니다. 네트워크 연결을 확인한 뒤 다시 시도해 주세요.",
      );
    }
  }, []);

  const selectedScheduleImage = team ? TEAM_SCHEDULE_IMAGES[team] : undefined;

  const handleBack = useCallback(() => {
    switch (screen) {
      case "team":
        go("name");
        return;
      case "landing":
        go("team");
        return;
      case "schedule":
        go("landing");
        return;
      case "game":
        go("landing");
        return;
      case "reward":
      case "retry":
        go("landing");
        return;
      case "name":
      default:
        resetFlow();
    }
  }, [go, resetFlow, screen]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />
        <ImageBackground
          source={BACKGROUND_IMAGE}
          style={styles.root}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            {screen !== "name" && (
              <Pressable style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>뒤로가기</Text>
              </Pressable>
            )}

            {screen === "name" && (
              <View style={styles.nameScreenOverlay}>
                <View style={styles.center}>
                  <Image
                    source={LOGO_IMAGE}
                    style={styles.heroLogo}
                    resizeMode="contain"
                  />
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
              </View>
            )}

            {screen === "team" && (
              <View style={styles.center}>
                <Text style={styles.heading}>응원 팀 선택</Text>
                <Text style={styles.sub}>응원하는 팀을 선택하세요.</Text>
                <View style={styles.teamGrid}>
                  {TEAM_OPTIONS.map((option) => (
                    <Pressable
                      key={option.key}
                      style={styles.teamCard}
                      onPress={() => selectTeam(option.key)}
                    >
                      <View style={styles.teamImageFrame}>
                        <Image
                          source={option.image}
                          style={styles.teamImage}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={styles.teamLabel}>{option.key}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {screen === "landing" && (
              <View style={styles.center}>
                <Image
                  source={LOGO_IMAGE}
                  style={styles.brandLogo}
                  resizeMode="contain"
                />
                <Text style={styles.heading}>
                  {team ? `${team} 팬 페이지` : "랜딩 페이지"}
                </Text>
                <Text style={styles.resultText}>
                  {(nickname.trim() || "플레이어") + "님 반갑습니다!"}
                </Text>
                <Text style={styles.sub}>원하는 메뉴를 선택하세요.</Text>
                <Pressable style={styles.btn} onPress={startGame}>
                  <Text style={styles.btnText}>게임 시작하기</Text>
                </Pressable>
                <Pressable style={styles.btn} onPress={() => go("schedule")}>
                  <Text style={styles.btnText}>경기 일정보러가기</Text>
                </Pressable>
              </View>
            )}

            {screen === "schedule" && (
              <View style={styles.center}>
                <Text style={styles.heading}>
                  {team ? `${team} 경기 일정` : "경기 일정"}
                </Text>
                <Text style={styles.sub}>
                  응원 팀의 경기 달력을 확인해보세요.
                </Text>
                <View style={styles.scheduleCard}>
                  {selectedScheduleImage ? (
                    <Image
                      source={selectedScheduleImage}
                      style={styles.scheduleImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.schedulePlaceholder}>
                      <Text style={styles.schedulePlaceholderTitle}>
                        {team
                          ? `${team} 일정 이미지 준비 중`
                          : "일정 이미지 준비 중"}
                      </Text>
                      <Text style={styles.schedulePlaceholderText}>
                        팀별 달력 이미지 10장을 주시면 바로 연결하겠습니다.
                      </Text>
                    </View>
                  )}
                </View>
                <Pressable style={styles.btn} onPress={() => go("landing")}>
                  <Text style={styles.btnText}>랜딩으로 돌아가기</Text>
                </Pressable>
              </View>
            )}

            {screen === "game" && (
              <GameBoard sessionKey={gameSession} onGameOver={handleGameOver} />
            )}

            {screen === "reward" && (
              <ScrollView
                contentContainerStyle={styles.rewardScroll}
                showsVerticalScrollIndicator={false}
              >
                <Image
                  source={LOGO_IMAGE}
                  style={styles.brandLogo}
                  resizeMode="contain"
                />
                <Text style={styles.heading}>리워드 획득!</Text>
                <Text style={styles.rewardResultText}>
                  {(nickname.trim() || "플레이어") +
                    "님 " +
                    lastScore +
                    "개 성공!"}
                </Text>
                <Text style={styles.rewardSub}>
                  {team ? `${team} 응원 미션 성공! ` : ""}
                  {REWARD_SCORE_THRESHOLD}점 이상 달성에 성공했어요.
                </Text>
                <View
                  style={[
                    styles.rewardImageFrame,
                    { aspectRatio: REWARD_IMAGE_ASPECT_RATIO },
                  ]}
                >
                  <Image
                    source={REWARD_IMAGE}
                    style={styles.rewardImage}
                    resizeMode="cover"
                  />
                </View>
                <Pressable style={styles.btn} onPress={downloadRewardImage}>
                  <Text style={styles.btnText}>리워드 다운받기</Text>
                </Pressable>
                <Pressable style={styles.btn} onPress={goHome}>
                  <Text style={styles.btnText}>홈으로</Text>
                </Pressable>
              </ScrollView>
            )}

            {screen === "retry" && (
              <View style={styles.center}>
                <Image
                  source={LOGO_IMAGE}
                  style={styles.brandLogo}
                  resizeMode="contain"
                />
                <Text style={styles.heading}>조금만 더!</Text>
                <Text style={styles.resultText}>
                  {(nickname.trim() || "플레이어") +
                    "님 " +
                    lastScore +
                    "개 성공!"}
                </Text>
                <Text style={styles.sub}>
                  {REWARD_SCORE_THRESHOLD}점 이상 달성하면 리워드를 받을 수
                  있어요.
                </Text>
                <Pressable style={styles.btn} onPress={restartGame}>
                  <Text style={styles.btnText}>다시 도전하기</Text>
                </Pressable>
                <Pressable style={styles.btn} onPress={goHome}>
                  <Text style={styles.btnText}>홈으로</Text>
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
    backgroundColor: "#000",
  },
  root: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  backButtonText: {
    ...appFont,
    color: "#fff",
    fontSize: 14,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  nameScreenOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.42)",
  },
  title: {
    ...appFont,
    fontSize: 28,
    color: "#fff",
    marginBottom: 8,
  },
  heroLogo: {
    width: "100%",
    maxWidth: 480,
    height: 200,
    marginBottom: 4,
  },
  brandLogo: {
    width: "100%",
    maxWidth: 220,
    height: 90,
    marginBottom: 8,
  },
  sub: {
    ...appFont,
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 28,
    textAlign: "center",
  },
  heading: {
    ...appFont,
    fontSize: 22,
    color: "#fff",
    marginBottom: 20,
  },
  input: {
    ...appFont,
    width: "100%",
    maxWidth: 280,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    color: "#fff",
    marginBottom: 20,
  },
  btn: {
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 30,
    backgroundColor: BUTTON_BG,
    marginTop: 6,
  },
  btnText: {
    ...appFont,
    fontSize: 18,
    color: BUTTON_TEXT,
  },
  teamGrid: {
    width: "100%",
    maxWidth: 280,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    rowGap: 14,
  },
  teamCard: {
    width: "50%",
    minWidth: 120,
    alignItems: "center",
  },
  teamImageFrame: {
    width: "100%",
    aspectRatio: 2,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 8,
  },
  teamImage: {
    width: "100%",
    height: "100%",
  },
  teamLabel: {
    ...appFont,
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
  },
  resultText: {
    ...appFont,
    fontSize: 22,
    color: "#fff",
    textAlign: "center",
    marginBottom: 28,
  },
  scheduleCard: {
    width: "100%",
    maxWidth: 360,
    aspectRatio: 1080 / 1350,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleImage: {
    width: "100%",
    height: "100%",
  },
  schedulePlaceholder: {
    width: "100%",
    minHeight: 320,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  schedulePlaceholderTitle: {
    ...appFont,
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
  },
  schedulePlaceholderText: {
    ...appFont,
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  rewardScroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    paddingBottom: 40,
  },
  rewardResultText: {
    ...appFont,
    fontSize: 22,
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  rewardSub: {
    ...appFont,
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 16,
    textAlign: "center",
  },
  rewardImageFrame: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#000",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  rewardImage: {
    width: "100%",
    height: "100%",
  },
});
