# Candy Confeitaria: site e app de orçamentos pelo WhatsApp

Doces personalizados para festa, em Leme-SP. A cliente escolhe os doces e as quantidades, informa a data da festa, o tema e o número de convidados, e o **pedido de orçamento chega organizado no WhatsApp (19) 99634-7835**. O site pode ser instalado na tela do celular como app (PWA).

> **Status:** nome, bio, cidade, WhatsApp, logo e fotos vieram do Instagram. Os itens marcados `CONFIRMAR` no `config.js` (horários, antecedência mínima, entrega, nomes dos doces) são suposições e precisam ser validados com ela. Logo e fotos foram recortados de um print: trocar pelos originais em alta.

## Modo orçamento

A Candy não trabalha com preço fixo (bio: "Contato para orçamentos"). Com `orcamento: true` o site:
- mostra "Sob orçamento" no lugar do preço;
- não mostra total nem forma de pagamento;
- pergunta a data da festa (mínimo de dias configurável), o tema e o número de convidados;
- envia um **PEDIDO DE ORÇAMENTO** em vez de um pedido fechado.

Para mostrar preço de algum item, basta preencher `preco` (aparece como "a partir de R$ ...").

Exemplo de mensagem que chega:

```
*PEDIDO DE ORÇAMENTO — Candy Confeitaria*
Orçamento nº 2411-1058

*Cliente:* Maria
*Receber:* Entrega
*Endereço:* Rua das Flores, 10
*Para:* 04/12/2026 (Sexta) às 15:00
*Tema da festa:* Peter Pan
*Nº de convidados:* 60

*Itens:*
• Docinhos finos decorados (Quantidade: 100 unidades)
• Cupcakes personalizados (Quantidade: 20 unidades)

*Observações:* cores verde e branco
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

```js
{
  id: 'cupcakes',            // identificador único, sem espaço nem acento
  categoria: 'personalizados', // precisa existir em "categorias"
  nome: 'Cupcakes personalizados',
  descricao: 'Decorados com o tema da festa.',
  preco: null,               // null = sob orçamento; 90 = "a partir de R$ 90,00"
  foto: 'fotos/cupcakes.jpg', // opcional; sem foto, aparece o emoji
  emoji: '🧁',
  destaque: true,            // aparece em "Mais pedidos"
  disponivel: false,         // mostra "Esgotado"
  ativo: false,              // some do site
  opcoes: [                  // o cliente escolhe 1 opção de cada grupo
    { nome: 'Quantidade', valores: ['25 unidades', '50 unidades', '100 unidades'] },
  ],
}
```

Fotos: preferir quadradas, até ~200 KB cada (JPG). Foto pesada deixa o site lento em 4G.

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

## Checklist antes de publicar

- [x] WhatsApp (19) 99634-7835 configurado
- [ ] Pedido de teste real enviado e recebido por ela
- [ ] Confirmar a lista de doces e as quantidades oferecidas
- [ ] Horários reais
- [ ] Regra de entrega: taxa única ou por bairro, pedido mínimo
- [ ] Antecedência mínima de encomenda (`encomenda.antecedenciaDias`)
- [ ] Faz entrega ou só retirada?
- [ ] Logo e fotos originais em alta (as atuais são recortes de print)
- [ ] Teste completo em Android e iPhone
