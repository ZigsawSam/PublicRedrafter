const fetch = (...args) =>

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body || {};

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const HF_KEY = process.env.HUGGING_FACE_API_KEY;

  if (!HF_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `[INST] You are a Prompt Engineer. Rewrite this prompt professionally and clearly: "${prompt}" [/INST]`,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || 'Inference API request failed'
      });
    }

    if (!Array.isArray(data) || !data[0]?.generated_text) {
      return res.status(500).json({
        error: 'Invalid response from model'
      });
    }

    const rawText = data[0].generated_text;

    const refinedPrompt = rawText
      .split('[/INST]')
      .pop()
      .trim();

    return res.status(200).json({
      result: refinedPrompt,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: 'Server error while processing request'
    });
  }
};
