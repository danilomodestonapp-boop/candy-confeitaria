# Candy Confeitaria: site de pedidos pelo WhatsApp

Doces finos e personalizados em Leme-SP. A cliente monta o pedido com o cardápio e os preços, informa a data da festa, o tema e o número de convidados, e o **pedido chega pronto no WhatsApp (19) 99684-6406**. O site pode ser instalado no celular como app (PWA).

> Cardápio, preços e regras vieram do PDF "Cardápio Candy Confeitaria". Pedidos a qualquer horário. Fotos dos personalizados extraídas do PDF; logo recortado do Instagram.

## Regras do cardápio no site

| Regra | Como o site aplica |
|---|---|
| Doces tradicionais (cento R$ 160) e especiais (cento R$ 190/200) | Cada sabor é escolhido de 25 em 25 (`lote: 25`). O envio só libera com **centos completos** (`regraCento`). Com lotes de 25, cada cento tem no máximo 4 sabores. Misturar tradicional e especial soma o valor proporcional. |
| Aplique em pasta americana: +R$ 1 por doce | Opção "Com aplique" em cada sabor (+R$ 25 por lote de 25) |
| Personalizados e doces por unidade | Quantidade de 10 em 10 (`passo: 10`). Pedido mínimo sujeito à disponibilidade. |
| Mínimo de 5 dias de antecedência | Calendário não aceita data anterior |
| 40% para reservar a data, restante na retirada | Total, sinal de 40% e restante aparecem no carrinho e na mensagem (`sinal: 0.4`) |

Exemplo de mensagem que chega:

```
*NOVO PEDIDO — Candy Confeitaria*
Pedido nº 2411-1407

*Cliente:* Maria
*Receber:* Retirar com a Candy
*Para:* 01/12/2026 (Terça)
*Tema da festa:* Fazendinha
*Nº de convidados:* 80

*Itens:*
• 50 un. Brigadeiro (Aplique: Sem aplique) — R$ 80,00
• 25 un. Leite Ninho (Aplique: Com aplique) — R$ 72,50
• 25 un. Floresta negra (Aplique: Sem aplique) — R$ 50,00
• 20x Mini trufas (Recheio: Maracujá) — R$ 90,00

Subtotal: R$ 292,50
*TOTAL: R$ 292,50*
Sinal 40% para reservar a data: R$ 117,00
Restante na retirada: R$ 175,50
```

## Arquivos

| Arquivo | Para que serve | Precisa editar? |
|---|---|---|
| `config.js` | Nome, WhatsApp, horários, entrega, pagamento, Pix, cores, **produtos e preços** | **Sim, é o único** |
| `fotos/` | Fotos dos produtos e o logo | Colocar as fotos |
| `index.html` | Título e prévia do link no WhatsApp | Só se mudar o nome |
| `app.js`, `styles.css`, `sw.js` | Funcionamento e visual | Não |
| `manifest.webmanifest`, `icons/` | Ícone e nome do app instalado | Opcional |

## Editar o cardápio (`config.js`)

Mudar preço: altere `preco` (por unidade) ou o valor do cento na lista de sabores (o site divide por 4 sozinho). Novo sabor: acrescente uma linha na lista de tradicionais ou especiais. Novo personalizado: copie um bloco existente (ex.: `mini-trufas`).

## Publicar (gratuito)

**Opção A, recomendada: GitHub Pages.** Repositório → Settings → Pages → Branch `main`, pasta do projeto. O site fica em `https://<usuario>.github.io/<repositorio>/`. A cada alteração no `config.js` o site atualiza sozinho.

**Opção B: Netlify Drop** (app.netlify.com/drop). Arrasta a pasta e recebe um link. Bom para mostrar rápido, mas cada alteração exige arrastar de novo.

**Domínio próprio** (ex.: `candyconfeitaria.com.br`) é opcional: custa cerca de R$ 40/ano no Registro.br e aponta para qualquer uma das opções acima.

Depois de publicar:
1. Colocar o link na **bio do Instagram**.
2. Configurar o link na **mensagem de saudação/ausência do WhatsApp Business** (quem chamar no WhatsApp recebe o cardápio).
3. Gerar um **QR Code** do link para imprimir em etiquetas, caixas e cartões.

## Testar localmente

Abrir `index.html` direto no navegador já funciona para conferir o cardápio e a mensagem. A instalação como app só funciona depois de publicado (exige HTTPS).

## Pendências

- [ ] Confirmar se é **somente retirada** (o site está assim)
- [ ] Pedido mínimo dos personalizados (hoje: de 10 em 10)
- [ ] Recheios da trufa cake (hoje: informar nas observações)
- [ ] Chave Pix para o sinal, se quiser exibir no site
- [ ] Logo em alta e fotos dos doces tradicionais/especiais
