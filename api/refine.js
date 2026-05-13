import https from 'https';

export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    try {

        const { prompt } = req.body;

        const bodyData = JSON.stringify({
            inputs: `Rewrite professionally: ${prompt}`
        });

        const options = {
            hostname: 'api-inference.huggingface.co',
            path: '/models/google/flan-t5-base',
            method: 'POST',
            headers: {
                'Authorization':
                    `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length':
                    Buffer.byteLength(bodyData)
            }
        };

        const hfResponse = await new Promise((resolve, reject) => {

            const request = https.request(
                options,
                (response) => {

                    let data = '';

                    response.on('data', chunk => {
                        data += chunk;
                    });

                    response.on('end', () => {
                        resolve(data);
                    });
                }
            );

            request.on('error', reject);

            request.write(bodyData);

            request.end();
        });

        console.log(hfResponse);

        let parsed;

        try {
            parsed = JSON.parse(hfResponse);
        } catch {
            return res.status(500).json({
                error: hfResponse
            });
        }

        return res.status(200).json({
            result:
                parsed?.[0]?.generated_text ||
                JSON.stringify(parsed)
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: error.toString()
        });
    }
}
