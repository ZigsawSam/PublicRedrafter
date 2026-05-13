module.exports = async (req, res) => {

    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    try {

        const prompt = req.body.prompt;

        if (!prompt) {
            return res.status(400).json({
                error: 'Prompt missing'
            });
        }

        const response = await fetch(
            'https://api-inference.huggingface.co/models/google/flan-t5-base',
            {
                method: 'POST',
                headers: {
                    Authorization:
                        `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs:
                        `Rewrite professionally: ${prompt}`
                })
            }
        );

        const data = await response.json();

        return res.status(200).json({
            result:
                data?.[0]?.generated_text ||
                JSON.stringify(data)
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: error.toString()
        });
    }
};
