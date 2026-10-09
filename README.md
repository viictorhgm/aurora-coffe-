# Aurora Coffee

Site institucional e de pedidos para retirada da Aurora Coffee (marca fictícia). HTML, CSS e JavaScript puros — sem build e sem backend.

## Rodar localmente

```bash
python3 -m http.server 5500 --bind 127.0.0.1
```

Depois abra <http://127.0.0.1:5500>. (Também funciona abrindo `index.html` direto no navegador.)

## Estrutura

- `index.html` — página única: início, cardápio, origens, a casa, agenda, visite.
- `css/styles.css` — tokens de cor/tipografia e todos os estilos.
- `js/menu-data.js` — **conteúdo editável**: cardápio, preços, horários de funcionamento e regras de retirada.
- `js/main.js` — status "aberto agora", abas do cardápio, pedido (carrinho salvo no navegador), validação dos formulários.
- `assets/favicon.svg` — marca.

## O que é simulado

- **Pedido para retirada** e **reserva de vaga**: validam os dados e mostram a confirmação, mas nada é enviado. Para produção, conecte o envio do formulário a um sistema de pedidos, WhatsApp Business ou e-mail.
- Endereço, telefone e e-mail são exemplos.
- Fotos carregadas do Unsplash (licença Unsplash). Para entrega final, troque por fotos da loja real e hospede em `assets/`.
