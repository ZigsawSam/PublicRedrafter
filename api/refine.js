export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    try {

        const { prompt } = req.body;

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

        const rawText = await response.text();

        console.log(rawText);

        let data;

        try {

            data = JSON.parse(rawText);

        } catch {

            return res.status(500).json({
                error: rawText
            });
        }

        return res.status(200).json({
            result:
                data?.[0]?.generated_text ||
                JSON.stringify(data)
        });

    } catch (error) {

        return res.status(500).json({
            error: error.toString()
        });
    }
}
