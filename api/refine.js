export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method not allowed'
      });
    }

    console.log('API started');

    console.log('ENV CHECK:', !!process.env.HUGGING_FACE_API_KEY);

    const prompt = req.body?.prompt;

    console.log('PROMPT:', prompt);

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt missing'
      });
    }

    const response = await fetch(
      'https://api-inference.huggingface.co/models/gpt2',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt
        })
      }
    );

    console.log('STATUS:', response.status);

    const data = await response.json();

    console.log('DATA:', data);

    return res.status(200).json({
      result: JSON.stringify(data, null, 2)
    });

  } catch (error) {
    console.error('FULL ERROR:', error);

    return res.status(500).json({
      error: String(error),
      stack: error?.stack
    });
  }
}
