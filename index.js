import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

app.post('/gerar-texto', async (req, res) => {
  const { prompt, tipo, usuario_id } = req.body;

  try {
    const respostaIA = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Gere um ${tipo} com base nesse pedido: ${prompt}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const respostaGerada = respostaIA.data.choices[0].message.content;

    await axios.post(
      `${SUPABASE_URL}/rest/v1/geracoes`,
      {
        prompt,
        tipo_de_texto: tipo,
        resposta: respostaGerada,
        usuario_id,
        created_at: new Date().toISOString()
      },
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ sucesso: true, resposta: respostaGerada });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ erro: "Erro ao gerar texto" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
