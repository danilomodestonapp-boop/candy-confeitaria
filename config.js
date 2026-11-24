/*
 * ============================================================
 *  CONFIGURAÇÃO DA LOJA — é só este arquivo que você edita.
 * ============================================================
 *  Fonte: Cardápio Candy Confeitaria (PDF) + Instagram @candyconfeitariam.
 *  Confirmado com a família:
 *    - WhatsApp de pedidos: (19) 99684-6406
 *    - Pedidos a qualquer horário
 *    - Pagamento: 40% no fechamento (reserva a data), restante na retirada
 *  ⚠️ "CONFIRMAR" = suposição minha, validar com ela.
 *
 *  Como funcionam os doces por CENTO (tradicionais e especiais):
 *    cada sabor é vendido em lotes de 25 (lote: 25). O site só deixa
 *    enviar centos completos (100, 200...). Com lotes de 25, cada cento
 *    tem no máximo 4 sabores, como manda o cardápio. Misturar categorias
 *    soma o valor proporcional de cada sabor.
 *
 *  Dicas rápidas:
 *  - Preço usa ponto: 47.5 = R$ 47,50
 *  - Para esconder um produto: ativo: false · Esgotado: disponivel: false
 *  - Destacar no topo: destaque: true
 */
window.LOJA = {
  id: 'candy-confeitaria', // não mude depois de publicado (guarda o carrinho do cliente)

  nome: 'Candy Confeitaria',
  slogan: 'Doces finos e personalizados',
  emoji: '🧁',
  logo: 'fotos/logo.jpg', // recortado do Instagram; trocar pelo arquivo original em alta

  // WhatsApp que RECEBE os pedidos: 55 + DDD + número, só dígitos
  whatsapp: '5519996846406',
  whatsappExibicao: '(19) 99684-6406',
  instagram: 'candyconfeitariam',
  endereco: '', // sem endereço público: o botão "Como chegar" fica escondido
  cidade: 'Leme - SP',

  orcamento: false, // cardápio com preço: o site calcula o total

  mensagemContato: 'Olá! Vim pelo site da Candy Confeitaria e gostaria de fazer um pedido.',
  avisoGeral: 'Encomendas com no mínimo 5 dias de antecedência. A data é reservada com o pagamento de 40% do pedido.',

  horarioLivre: true,
  textoHorarioLivre: 'Faça seu pedido a qualquer hora pelo site. Respondemos pelo WhatsApp para confirmar a data.',
  horarios: {}, // não usado com horarioLivre

  entrega: {
    retirada: true,
    textoRetirada: 'Retirar com a Candy', // CONFIRMAR: só retirada? ("restante na retirada")
    delivery: false,
    taxa: 0,
    bairros: [],
    pedidoMinimo: 0,
    observacao: '',
  },

  encomenda: {
    exigeData: true,
    antecedenciaDias: 5,
    rotuloData: 'Data da festa / retirada',
    aviso: 'Mínimo de 5 dias de antecedência, desde que a data esteja disponível. A Candy confirma pelo WhatsApp.',
  },

  // Pagamento: 40% para reservar a data, restante na retirada
  sinal: 0.4,
  textoRestante: 'Restante na retirada',
  pagamentos: [], // forma de pagamento combinada no WhatsApp
  pix: '', // CONFIRMAR: chave Pix para o sinal, se quiser que apareça no site

  regraCento: {
    tamanho: 100,
    aviso: 'Doces tradicionais e especiais são vendidos por cento (até 4 sabores por cento, 25 de cada).',
  },

  camposExtras: [
    { nome: 'tema', rotulo: 'Tema da festa', exemplo: 'Ex.: fazendinha, sereia, 15 anos…' },
    { nome: 'convidados', rotulo: 'Nº de convidados', tipo: 'number', exemplo: 'Ex.: 50' },
  ],

  placeholderObs: 'Ex.: cores da festa, nome do aniversariante, recheio da trufa cake, alergias…',
  rodapeMensagem: 'Pedido feito pelo site 🙂 Aguardo a confirmação da data.',

  // Cores tiradas do logo (rosa e creme)
  tema: {
    primaria: '#a8566f',
    'primaria-escura': '#874158',
    secundaria: '#f6ede6',
    fundo: '#fdf9f6',
  },

  tituloDestaques: '⭐ Personalizados mais pedidos',
  compactoSemFoto: true, // sabores sem foto aparecem em lista compacta

  categorias: [
    {
      id: 'tradicionais',
      nome: 'Doces tradicionais',
      descricao: 'Cento R$ 160,00. Escolha de 25 em 25: até 4 sabores por cento. Aplique em pasta americana: +R$ 1 por doce.',
    },
    {
      id: 'especiais',
      nome: 'Doces especiais',
      descricao: 'Cento R$ 190,00 ou R$ 200,00. Escolha de 25 em 25 e misture com os tradicionais. Aplique: +R$ 1 por doce.',
    },
    {
      id: 'personalizados',
      nome: 'Personalizados',
      descricao: 'Doces com aplique em pasta americana. Quantidade de 10 em 10; pedido mínimo sujeito à disponibilidade.',
    },
    { id: 'doces', nome: 'Doces' },
  ],

  // ===================== CARDÁPIO (PDF) =====================
  produtos: [
    // ---- Tradicionais: cento R$ 160 → lote de 25 = R$ 40
    ...[
      ['brigadeiro', 'Brigadeiro'],
      ['beijinho', 'Beijinho'],
      ['brigadeiro-branco', 'Brigadeiro branco'],
      ['bicho-de-pe', 'Bicho de pé'],
    ].map(([id, nome, foto]) => ({
      id,
      categoria: 'tradicionais',
      nome,
      descricao: 'Cento R$ 160,00',
      preco: 40,
      unidade: '25 un.',
      lote: 25,
      foto,
      emoji: '🍫',
      opcoes: [{ nome: 'Aplique', valores: ['Sem aplique', { nome: 'Com aplique', acrescimo: 25 }] }],
    })),

    // ---- Especiais: cento R$ 190 ou R$ 200 → lote de 25 = R$ 47,50 ou R$ 50
    ...[
      ['leite-ninho', 'Leite Ninho', 190],
      ['oreo', 'Oreo', 190],
      ['churros', 'Churros', 190],
      ['pacoca', 'Paçoca', 190],
      ['floresta-negra', 'Floresta negra', 200],
      ['floresta-branca', 'Floresta branca', 200],
      ['cereja', 'Cereja', 200],
      ['ninho-nutella', 'Ninho com Nutella', 200],
      ['ninho-doce-de-leite', 'Ninho com doce de leite', 200],
    ].map(([id, nome, cento]) => ({
      id,
      categoria: 'especiais',
      nome,
      descricao: `Cento R$ ${cento},00`,
      preco: cento / 4,
      unidade: '25 un.',
      lote: 25,
      emoji: '🍬',
      opcoes: [{ nome: 'Aplique', valores: ['Sem aplique', { nome: 'Com aplique', acrescimo: 25 }] }],
    })),

    // ---- Personalizados (com aplique em pasta americana), por unidade
    // Pedido mínimo: "verifique a disponibilidade" → quantidade de 10 em 10 (CONFIRMAR mínimo)
    {
      id: 'mini-trufas',
      categoria: 'personalizados',
      nome: 'Mini trufas',
      descricao: 'Casquinha fina de chocolate com recheio cremoso, decoradas no tema.',
      preco: 4.5,
      unidade: 'un.',
      passo: 10,
      foto: 'fotos/mini-trufas.jpg',
      destaque: true,
      opcoes: [{ nome: 'Recheio', valores: ['Tradicional', 'Leite Ninho', 'Prestígio', 'Maracujá'] }],
    },
    {
      id: 'copinho-chocolate',
      categoria: 'personalizados',
      nome: 'Copinho de chocolate',
      descricao: 'Copinhos de chocolate nobre recheados.',
      preco: 4.5,
      unidade: 'un.',
      passo: 10,
      foto: 'fotos/copinho-chocolate.jpg',
      opcoes: [{ nome: 'Recheio', valores: ['Tradicional', 'Leite Ninho', 'Prestígio', 'Maracujá'] }],
    },
    {
      id: 'trufa-cake',
      categoria: 'personalizados',
      nome: 'Trufa cake',
      descricao: 'Mini bolinho de casquinha de chocolate ao leite com recheio à sua escolha (informe nas observações).',
      preco: 6,
      unidade: 'un.',
      passo: 10,
      foto: 'fotos/trufa-cake.jpg',
      destaque: true,
    },
    {
      id: 'mini-cupcakes',
      categoria: 'personalizados',
      nome: 'Mini cupcakes',
      descricao: 'Bolinho com cobertura decorativa em pasta americana.',
      preco: 7.5,
      unidade: 'un.',
      passo: 10,
      foto: 'fotos/mini-cupcake.jpg',
      destaque: true,
      opcoes: [{ nome: 'Recheio', valores: ['Doce de leite', 'Nutella'] }],
    },
    {
      id: 'pirulito-chocolate',
      categoria: 'personalizados',
      nome: 'Pirulito de chocolate (5 cm)',
      descricao: 'Decorado com o tema da sua festa.',
      preco: 8,
      unidade: 'un.',
      passo: 10,
      foto: 'fotos/pirulito-chocolate.jpg',
    },

    // ---- Doces, por unidade
    {
      id: 'concha',
      categoria: 'doces',
      nome: 'Concha',
      descricao: 'Concha de chocolate recheada com creme de Leite Ninho.',
      preco: 4.5,
      unidade: 'un.',
      passo: 10,
      foto: 'fotos/concha.jpg',
    },
    {
      id: 'porta-retrato',
      categoria: 'doces',
      nome: 'Porta-retrato',
      descricao: 'Chocolate com letras.',
      preco: 9.5,
      unidade: 'un.',
      passo: 10, // CONFIRMAR: talvez seja vendido em quantidade menor
    },
  ],
};
