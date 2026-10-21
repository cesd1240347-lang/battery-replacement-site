exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { prompt } = JSON.parse(event.body);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "APIキーが設定されていません。" }) };
  }

  const systemInstruction = "あなたはスマートフォンのバッテリー交換をサポートする専門アシスタントです。ユーザーが作業中に困ったことに対して、安全第一で、簡潔かつ丁寧に手順や対処法をアドバイスしてください。バッテリーの膨張や発火の恐れがある危険な状態の質問には、直ちに作業を中断するよう強い警告を添えてください。";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: `${systemInstruction}\n\n質問: ${prompt}` }] }
          ]
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "回答を取得できませんでした。";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
