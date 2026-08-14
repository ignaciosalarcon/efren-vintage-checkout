const { MercadoPagoConfig, Preference } = require('mercadopago');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  try {
    const { title, price, quantity, code } = req.body;

    if (!title || !price) {
      res.status(400).json({ error: 'Falta el nombre o el precio del producto' });
      return;
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });
    const preference = new Preference(client);

    const origin = req.headers.origin || `https://${req.headers.host}`;

    const result = await preference.create({
      body: {
        items: [
          {
            id: code || 'EFREN',
            title: title,
            quantity: Number(quantity) || 1,
            unit_price: Number(price),
            currency_id: 'ARS',
          },
        ],
        back_urls: {
          success: `${origin}/exito.html`,
          failure: `${origin}/error.html`,
          pending: `${origin}/pendiente.html`,
        },
        auto_return: 'approved',
        statement_descriptor: 'EFREN VINTAGE',
      },
    });

    res.status(200).json({
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo generar el link de pago' });
  }
};
