// =============================================================
// Google Calendar の予定を取得し、カード形式で表示するスクリプト
// 役割:
//   1. 公開設定された Google カレンダーから今日以降のイベント取得
//   2. 必要項目（タイトル / 日付 / 開始時刻）を整形
//   3. HTML 要素を生成して指定コンテナに差し込む
// =============================================================

// NOTE: APIキーは公開リポジトリにコミットしないのが基本。必要なら .env + ビルド時注入などを検討。
// 仮置きのキー（開発用）: 必要に応じて差し替え/削除してください。
const API_KEY = "AIzaSyBn5bhiZ-YHwY1VAHTHbsTTtIFrwkOonJk"; 

// 取得対象の Google カレンダーID（公開 or 共有設定済み）
const CALENDAR_ID = "87cc5b05c2cc9fa95ffbc1be345dabe23ff34907ebc0e867d90ead3e8b26ddd0@group.calendar.google.com";

// API エンドポイントを組み立て
// singleEvents=true: 繰り返しイベントを単発に展開
// orderBy=startTime: 開始時刻順ソート
// timeMin=現在時刻: 過去イベントを除外
const API_URL = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events` +
  `?key=${API_KEY}&singleEvents=true&orderBy=startTime&timeMin=${new Date().toISOString()}`;

// カードを追加するコンテナ（index.html 内に <div id="calendar-cards"></div> を用意）
const container = document.getElementById("calendar-cards");

// イベント取得～描画のメイン関数
async function loadCalendarEvents() {
  try {
    // 1) APIへリクエスト
    const res = await fetch(API_URL);
    // 2) JSONに変換
    const data = await res.json();

    // 防御的チェック: items が存在しない/空の場合はメッセージ表示
    if (!data.items || data.items.length === 0) {
      container.innerHTML = "<p>予定がありません</p>";
      return;
    }

    // 表示件数を制御: 例として最初の3件のみ（必要なら slice を削除）
    data.items.slice(0, 3).forEach(event => {
      // start.dateTime が通常、終日予定なら start.date が使われる
      const startRaw = event.start.dateTime || event.start.date;
      const startDate = new Date(startRaw);

      // 日付表示: 2025年11月20日(木) のような形式
      const dateStr = startDate.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      });

      // 時刻表示: 終日予定には開始時刻が無いのでその場合は非表示にもできる
      const timeStr = event.start.dateTime
        ? startDate.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
        : "終日"; // 終日予定のラベル

      // カード用の div 作成
      const card = document.createElement("div");
      card.className = "calendar-card";

      // タイトルが無い場合のフォールバック（練習日）
      const title = event.summary || "練習日";

      // ここで HTML テンプレートを埋め込む（XSSの危険性: 公式APIの summary は信頼度高いが気になるなら textContent使用へ変更）
      card.innerHTML = `
        <h3 class="calendar-card__title">${title}</h3>
        <p class="calendar-card__date">${dateStr}</p>
        <p class="calendar-card__time">${timeStr}</p>
      `;

      // コンテナへ挿入
      container.appendChild(card);
    });

  } catch (err) {
    // ネットワークエラー / APIキー不正 / CORS など
    console.error("Calendar API error:", err);
    container.innerHTML = "<p>データを読み込めませんでした。</p>";
  }
}

// DOM読み込み後すぐ実行（必要なら window.addEventListener("DOMContentLoaded", ...) に変更）
loadCalendarEvents();
