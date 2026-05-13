module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

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
          inputs: `[INST] You are a Prompt Engineer. Rewrite this prompt to be professional, structured, and effective for an AI: "${prompt}" [/INST]`,
          parameters: { max_new_tokens: 300 },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(503).json({ error: 'Model is booting up. Please wait 20 seconds and try again.' });
    }

    const rawText = data[0].generated_text;
    const refinedPrompt = rawText.split('[/INST]').pop().trim();

    return res.status(200).json({ result: refinedPrompt });
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Error processing your request. Please try again.' });
  }
};
