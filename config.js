/*
 * ============================================================
 *  CONFIGURAÇÃO DA LOJA — é só este arquivo que você edita.
 * ============================================================
 *  Dados confirmados pelo Instagram (@candyconfeitariam):
 *    nome, bio e cidade (Leme-SP).
 *  WhatsApp: (19) 99634-7835 (o mesmo da bio do Instagram).
 *  ⚠️ Marcado com "CONFIRMAR": suposição minha, validar com ela.
 *
 *  A Candy trabalha com ORÇAMENTO (sem preço fixo no site):
 *  a cliente monta o pedido e a Candy responde o valor no WhatsApp.
 *  Se um dia quiser mostrar preço, coloque "preco" no produto
 *  (aparece como "a partir de R$ ...").
 *
 *  Dicas rápidas:
 *  - Para esconder um produto de vez: ativo: false
 *  - Para mostrar como "Esgotado": disponivel: false
 *  - Para destacar no topo ("Mais pedidos"): destaque: true
 *  - Foto: coloque o arquivo na pasta "fotos" e use foto: 'fotos/nome.jpg'
 */
window.LOJA = {
  id: 'candy-confeitaria', // não mude depois de publicado (guarda o carrinho do cliente)

  nome: 'Candy Confeitaria',
  slogan: 'Doces personalizados para sua festa',
  emoji: '🧁',
  logo: 'fotos/logo.jpg', // recortado do Instagram; trocar pelo arquivo original em alta

  whatsapp: '5519996347835',
  whatsappExibicao: '(19) 99634-7835',
  instagram: 'candyconfeitariam',
  endereco: '', // sem endereço público: o botão "Como chegar" fica escondido
  cidade: 'Leme - SP',

  orcamento: true,
  textoOrcamento: 'Os valores dependem da quantidade, do tema e do acabamento. A Candy responde o orçamento pelo WhatsApp.',

  mensagemContato: 'Olá! Vim pelo site da Candy Confeitaria e gostaria de um orçamento.',
  avisoFechado: 'Fora do horário de atendimento: pode pedir seu orçamento que respondemos assim que possível.',
  avisoGeral: '',

  // Horário de atendimento no WhatsApp. Vazio ('') = fechado.
  horarios: { // CONFIRMAR
    seg: '09:00-18:00',
    ter: '09:00-18:00',
    qua: '09:00-18:00',
    qui: '09:00-18:00',
    sex: '09:00-18:00',
    sab: '09:00-13:00',
    dom: '',
  },

  entrega: {
    retirada: true,
    textoRetirada: 'Retirar em Leme',
    delivery: true,
    taxa: 0,
    bairros: [],
    pedidoMinimo: 0,
    observacao: 'Entrega e taxa combinadas pelo WhatsApp.', // CONFIRMAR se ela entrega
  },

  encomenda: {
    exigeData: true,
    antecedenciaDias: 7, // CONFIRMAR antecedência mínima
    rotuloData: 'Data da festa',
    aviso: 'Pedidos com pelo menos 7 dias de antecedência. A data só fica reservada após a confirmação pelo WhatsApp.', // CONFIRMAR
  },

  // Perguntas extras do orçamento (aparecem no formulário e na mensagem)
  camposExtras: [
    { nome: 'tema', rotulo: 'Tema da festa', exemplo: 'Ex.: Peter Pan, jardim, 15 anos…' },
    { nome: 'convidados', rotulo: 'Nº de convidados', tipo: 'number', exemplo: 'Ex.: 50' },
  ],

  pagamentos: ['Pix', 'Dinheiro', 'Cartão'], // não aparece no modo orçamento
  pix: '',

  placeholderObs: 'Ex.: cores da festa, nome do aniversariante, sabores preferidos, alergias…',
  rodapeMensagem: 'Pedido de orçamento feito pelo site 🙂',

  // Cores tiradas do logo (rosa e creme)
  tema: {
    primaria: '#a8566f',
    'primaria-escura': '#874158',
    secundaria: '#f6ede6',
    fundo: '#fdf9f6',
  },

  // Categorias como no catálogo dela (post do Instagram): Tradicionais, Gourmet e Personalizados
  categorias: [
    { id: 'tradicionais', nome: 'Tradicionais' },
    { id: 'gourmet', nome: 'Gourmet' },
    { id: 'personalizados', nome: 'Personalizados' },
  ],

  // Produtos montados a partir das fotos do Instagram. CONFIRMAR nomes,
  // sabores e quantidades mínimas. Fotos recortadas do perfil: trocar
  // pelas originais em alta para ficar mais nítido.
  produtos: [
    {
      id: 'docinhos-finos',
      categoria: 'gourmet',
      nome: 'Docinhos gourmet decorados',
      descricao: 'Acabamento com detalhes dourados e forminhas de flor nas cores da festa.',
      preco: null,
      foto: 'fotos/docinhos-finos.jpg',
      destaque: true,
      opcoes: [
        { nome: 'Quantidade', valores: ['25 unidades', '50 unidades', '100 unidades', 'Mais de 100 (informar nas observações)'] },
      ],
    },
    {
      id: 'brigadeiros',
      categoria: 'tradicionais',
      nome: 'Brigadeiros e docinhos tradicionais',
      descricao: 'Brigadeiro, beijinho e outros clássicos, em forminhas.',
      preco: null,
      foto: 'fotos/brigadeiros.jpg',
      opcoes: [
        { nome: 'Quantidade', valores: ['25 unidades', '50 unidades', '100 unidades', 'Mais de 100 (informar nas observações)'] },
      ],
    },
    {
      id: 'bombons',
      categoria: 'gourmet',
      nome: 'Bombons e trufas',
      descricao: 'Chocolate branco e ao leite, com acabamento decorado.',
      preco: null,
      foto: 'fotos/bombons.jpg',
      opcoes: [
        { nome: 'Quantidade', valores: ['25 unidades', '50 unidades', '100 unidades', 'Mais de 100 (informar nas observações)'] },
      ],
    },
    {
      id: 'modelados',
      categoria: 'personalizados',
      nome: 'Docinhos modelados no tema',
      descricao: 'Bichinhos e personagens modelados à mão sobre o docinho (ex.: cavalinho, pintinho).',
      preco: null,
      foto: 'fotos/cavalinhos.jpg',
      destaque: true,
      opcoes: [
        { nome: 'Quantidade', valores: ['25 unidades', '50 unidades', '100 unidades', 'Mais de 100 (informar nas observações)'] },
      ],
    },
    {
      id: 'cupcakes',
      categoria: 'personalizados',
      nome: 'Cupcakes personalizados',
      descricao: 'Decorados com o tema, a inicial ou o nome do aniversariante.',
      preco: null,
      foto: 'fotos/cupcakes.jpg',
      destaque: true,
      opcoes: [{ nome: 'Quantidade', valores: ['10 unidades', '20 unidades', '30 unidades', 'Mais de 30 (informar nas observações)'] }],
    },
    {
      id: 'pirulitos',
      categoria: 'personalizados',
      nome: 'Pirulitos de chocolate decorados',
      descricao: 'Feitos no tema da festa. Ótimos de lembrancinha.',
      preco: null,
      foto: 'fotos/pirulitos-tema.jpg',
      opcoes: [{ nome: 'Quantidade', valores: ['10 unidades', '20 unidades', '30 unidades', 'Mais de 30 (informar nas observações)'] }],
    },
    {
      id: 'mesa-doces',
      categoria: 'personalizados',
      nome: 'Mesa de doces completa',
      descricao: 'A Candy monta a combinação de doces conforme o tema e o número de convidados.',
      preco: null,
      foto: 'fotos/mesa-doces.jpg',
    },
  ],
};
