// ★★★ あなたの GAS Web App URL ★★★
const GAS_URL = "https://script.google.com/macros/s/AKfycbwWL1DoKXbCw6AiUhBeaa7zwn_jL7hQXg5-AGZFiB8eWDhw04R9Crn4318D_NAIHOxEtA/exec";

// HTML 側の form id が contactForm なので合わせる
document.getElementById("contactForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const status = document.getElementById("formStatus");
    status.style.display = "block";
    status.style.fontWeight = "700";
    status.textContent = "送信中です…";

    // Form → JSON 形式に変換
    const data = {
        email: this.email.value,
        name: this.name.value,
        age: this.age.value,
        date: this.date.value,
        questionType: this.questionType.value,
        tennisHistory: this.tennisHistory.value,
        other: this.other.value
    };

    try {
        // CORS preflight を避けるため、Content-Type を
        // application/x-www-form-urlencoded にして送信します。
        const body = new URLSearchParams(data).toString();

        const res = await fetch(GAS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body
        });

        const resultText = await res.text();
        console.log("GAS response:", resultText);

        status.style.color = "#16a34a"; // green
        status.textContent = "送信が完了しました！ありがとうございました。";

        this.reset();

    } catch (err) {
        console.error(err);
        status.style.color = "#dc2626"; // red
        status.textContent = "送信に失敗しました。時間をおいて再度お試しください。";
    }
});
