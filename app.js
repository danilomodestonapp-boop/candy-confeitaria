/*
 * Motor do site/app de pedidos.
 * NÃO é preciso mexer aqui para trocar produtos, preços, telefone ou horários:
 * tudo isso fica no arquivo config.js.
 */
(function () {
  'use strict';

  const L = window.LOJA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const KEY = 'pedido:' + L.id;
  // Modo orçamento: sem total nem pagamento; a loja responde o valor pelo WhatsApp.
  const ORC = !!L.orcamento;
  // Textos do modo sem preço. Padrão = orçamento; cada loja pode trocar em "textosSemPreco".
  const TXT = ORC
    ? Object.assign(
        {
          semPreco: 'Sob orçamento',
          seu: 'Seu orçamento',
          oItem: 'o orçamento',
          numero: 'Orçamento',
          verCarrinho: 'Ver orçamento',
          adicionar: 'Adicionar ao orçamento',
          enviar: 'Pedir orçamento pelo WhatsApp',
          botaoComoPedir: 'Pedir orçamento',
          titulo: 'PEDIDO DE ORÇAMENTO',
          resposta: 'Respondemos no WhatsApp com o valor e a confirmação da data.',
          obrigado: 'Obrigado pelo pedido de orçamento! 💛',
        },
        L.textosSemPreco || {}
      )
    : {
        seu: 'Seu pedido',
        oItem: 'o pedido',
        numero: 'Pedido',
        verCarrinho: 'Ver pedido',
        enviar: 'Enviar pedido pelo WhatsApp',
        botaoComoPedir: 'Enviar pedido',
        titulo: 'NOVO PEDIDO',
        obrigado: 'Obrigado pelo pedido! 💛',
      };
  const extras = L.camposExtras || [];

  // localStorage pode falhar (aba anônima, bloqueio). Nada quebra se falhar.
  const storage = {
    get(k, def) {
      try {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : def;
      } catch (e) {
        return def;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch (e) {
        /* sem armazenamento: segue sem lembrar */
      }
    },
  };

  const produtos = L.produtos.filter((p) => p.ativo !== false);
  const produtoPorId = Object.fromEntries(produtos.map((p) => [p.id, p]));

  // ---------------------------------------------------------------- telefone / links
  const numeroWhats = String(L.whatsapp).replace(/\D/g, '');
  const linkWhats = (texto) => `https://wa.me/${numeroWhats}?text=${encodeURIComponent(texto)}`;

  // ---------------------------------------------------------------- opções e preço
  const valorOpcao = (v) => (typeof v === 'string' ? { nome: v, acrescimo: 0 } : { acrescimo: 0, ...v });

  function precoUnitario(p, escolhas) {
    let total = p.preco;
    (p.opcoes || []).forEach((op) => {
      const v = op.valores.map(valorOpcao).find((x) => x.nome === escolhas[op.nome]);
      if (v) total += v.acrescimo;
    });
    return total;
  }

  function precoMinimo(p) {
    let total = p.preco;
    (p.opcoes || []).forEach((op) => {
      const vals = op.valores.map(valorOpcao).filter((v) => !v.esgotado);
      total += Math.min(...(vals.length ? vals : op.valores.map(valorOpcao)).map((v) => v.acrescimo));
    });
    return total;
  }

  // Quando a quantidade já é uma opção do produto (ex.: "50 unidades"), não mostra o contador +/−.
  const qtdNaOpcao = (p) => (p.opcoes || []).some((op) => /quantidade/i.test(op.nome));

  const passo = (p) => p.passo || 1;
  // Quantidade exibida: com "lote" (ex.: 25 doces por item) mostra o total de unidades
  const qtdTexto = (p, q) => (p.lote ? `${q * p.lote} un.` : String(q));

  const temVariacaoDePreco = (p) =>
    (p.opcoes || []).some((op) => new Set(op.valores.map((v) => valorOpcao(v).acrescimo)).size > 1);

  // ---------------------------------------------------------------- horários
  const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
  const NOME_DIA = { dom: 'Domingo', seg: 'Segunda', ter: 'Terça', qua: 'Quarta', qui: 'Quinta', sex: 'Sexta', sab: 'Sábado' };
  const paraMin = (h) => {
    const [hh, mm] = h.trim().split(':').map(Number);
    return hh * 60 + (mm || 0);
  };
  const intervalos = (str) => (str ? str.split(',').map((f) => f.split('-').map(paraMin)) : []);

  function abertoAgora(d = new Date()) {
    if (L.horarioLivre) return true; // pedidos a qualquer hora
    const min = d.getHours() * 60 + d.getMinutes();
    return intervalos(L.horarios[DIAS[d.getDay()]]).some(([a, f]) => min >= a && min < f);
  }

  // ---------------------------------------------------------------- estado
  const chaveItem = (id, escolhas) => id + '|' + JSON.stringify(escolhas);

  // Recarrega o carrinho salvo, descartando itens que saíram do catálogo
  // e recalculando o preço (caso o preço tenha mudado no config.js).
  let carrinho = storage
    .get(KEY + ':carrinho', [])
    .filter((i) => produtoPorId[i.id] && produtoPorId[i.id].disponivel !== false)
    .map((i) => ({ ...i, preco: precoUnitario(produtoPorId[i.id], i.escolhas || {}) }));

  const dados = Object.assign(
    { nome: '', tipo: '', endereco: '', bairro: '', referencia: '', data: '', hora: '', pagamento: '', troco: '', obs: '' },
    storage.get(KEY + ':cliente', {})
  );
  extras.forEach((c) => (dados[c.nome] = ''));
  dados.data = '';
  dados.hora = '';
  dados.obs = '';

  const salvarCarrinho = () => storage.set(KEY + ':carrinho', carrinho);
  const salvarCliente = () => {
    const { nome, tipo, endereco, bairro, referencia, pagamento } = dados;
    storage.set(KEY + ':cliente', { nome, tipo, endereco, bairro, referencia, pagamento });
  };

  function adicionar(id, escolhas, qtd) {
    const p = produtoPorId[id];
    const k = chaveItem(id, escolhas);
    const existente = carrinho.find((i) => i.chave === k);
    if (existente) existente.qtd += qtd;
    else carrinho.push({ chave: k, id, escolhas, qtd, preco: precoUnitario(p, escolhas) });
    salvarCarrinho();
    atualizarResumo();
    toast(`${p.lote ? qtdTexto(p, qtd) : qtd + 'x'} ${p.nome} no carrinho`);
  }

  function alterarQtd(k, delta) {
    const item = carrinho.find((i) => i.chave === k);
    if (!item) return;
    item.qtd += delta;
    if (item.qtd <= 0) carrinho = carrinho.filter((i) => i.chave !== k);
    salvarCarrinho();
    atualizarResumo();
    renderItensCarrinho();
  }

  const tiposEntrega = () => {
    const t = [];
    if (L.entrega.retirada) t.push({ id: 'retirada', nome: L.entrega.textoRetirada || 'Retirar no local' });
    if (L.entrega.delivery) t.push({ id: 'entrega', nome: 'Entrega' });
    return t;
  };

  function taxaEntrega() {
    if (dados.tipo !== 'entrega') return 0;
    const bairros = L.entrega.bairros || [];
    if (bairros.length) {
      const b = bairros.find((x) => x.nome === dados.bairro);
      return b ? b.taxa : 0;
    }
    return L.entrega.taxa || 0;
  }

  function totais() {
    const subtotal = carrinho.reduce((s, i) => s + i.preco * i.qtd, 0);
    const qtd = carrinho.reduce((s, i) => s + i.qtd, 0);
    const taxa = taxaEntrega();
    return { subtotal, qtd, taxa, total: subtotal + taxa };
  }

  // ---------------------------------------------------------------- tema
  function aplicarTema() {
    if (L.fotoRetrato) document.body.classList.add('fotos-retrato');
    const r = document.documentElement.style;
    Object.entries(L.tema || {}).forEach(([k, v]) => r.setProperty('--' + k, v));
  }

  // ---------------------------------------------------------------- topo
  function renderTopo() {
    const aberto = abertoAgora();
    $('#topo').innerHTML = `
      <div class="topo-conteudo">
        <div class="logo" aria-hidden="true">${L.logo ? `<img src="${esc(L.logo)}" alt="">` : esc(L.emoji)}</div>
        <div class="topo-textos">
          <h1>${esc(L.nome)}</h1>
          <p class="slogan">${esc(L.slogan)}</p>
          ${L.horarioLivre ? '' : `<span class="status ${aberto ? 'aberto' : 'fechado'}">${aberto ? 'Aberto agora' : 'Fechado agora'}</span>`}
        </div>
      </div>
      <div class="topo-acoes">
        <a class="chip" href="${linkWhats(L.mensagemContato || 'Olá! Vim pelo site.')}" target="_blank" rel="noopener">💬 Falar no WhatsApp</a>
        ${L.instagram ? `<a class="chip" href="https://www.instagram.com/${esc(L.instagram)}/" target="_blank" rel="noopener">📷 Instagram</a>` : ''}
        ${L.endereco ? `<a class="chip" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(L.endereco)}" target="_blank" rel="noopener">📍 Como chegar</a>` : ''}
        <button class="chip" id="btnInstalar" ${eventoInstalar ? '' : 'hidden'}>📲 Instalar app</button>
      </div>
      ${!aberto && L.avisoFechado ? `<p class="aviso">${esc(L.avisoFechado)}</p>` : ''}
      ${L.avisoGeral ? `<p class="aviso destaque">${esc(L.avisoGeral)}</p>` : ''}`;
  }

  // ---------------------------------------------------------------- catálogo
  function cardProduto(p) {
    const indisponivel = p.disponivel === false;
    // Sem foto e loja com "compactoSemFoto": card em formato de lista (sem a caixa do emoji)
    const compacto = !p.foto && L.compactoSemFoto;
    const foto = p.foto
      ? `<img src="${esc(p.foto)}" alt="${esc(p.nome)}" loading="lazy">`
      : `<span class="emoji" aria-hidden="true">${esc(p.emoji || L.emoji)}</span>`;
    return `
      <article class="produto${indisponivel ? ' indisponivel' : ''}${compacto ? ' compacto' : ''}">
        ${compacto ? `<span class="qtd-badge" data-badge="${esc(p.id)}" hidden></span>` : `<div class="foto">${foto}<span class="qtd-badge" data-badge="${esc(p.id)}" hidden></span></div>`}
        <div class="info">
          <h3>${esc(p.nome)}</h3>
          ${p.descricao ? `<p class="descricao">${esc(p.descricao)}</p>` : ''}
          <div class="linha-preco">
            ${htmlPreco(p)}
            <button class="btn-add" data-add="${esc(p.id)}" ${indisponivel ? 'disabled' : ''}>${indisponivel ? 'Esgotado' : 'Adicionar'}</button>
          </div>
        </div>
      </article>`;
  }

  function htmlPreco(p) {
    if (ORC && !p.preco) return `<span class="preco"><small>${esc(TXT.semPreco)}</small></span>`;
    const aPartir = ORC || temVariacaoDePreco(p);
    return `<span class="preco">${aPartir ? '<small>a partir de</small> ' : ''}${brl(precoMinimo(p))}${p.unidade ? `<small> / ${esc(p.unidade)}</small>` : ''}</span>`;
  }

  function renderCardapio() {
    const destaques = produtos.filter((p) => p.destaque && p.disponivel !== false);
    const secoes = [];
    if (destaques.length) secoes.push({ id: 'destaques', nome: L.tituloDestaques || '⭐ Mais pedidos', itens: destaques });
    L.categorias.forEach((c) => {
      const itens = produtos.filter((p) => p.categoria === c.id);
      if (itens.length) secoes.push({ id: c.id, nome: c.nome, descricao: c.descricao, itens });
    });

    $('#categorias').innerHTML = secoes
      .map((s) => `<a class="cat" href="#sec-${esc(s.id)}">${esc(s.nome)}</a>`)
      .join('');

    $('#cardapio').innerHTML = secoes
      .map(
        (s) => `
        <section class="secao" id="sec-${esc(s.id)}">
          <h2>${esc(s.nome)}</h2>
          ${s.descricao ? `<p class="secao-desc">${esc(s.descricao)}</p>` : ''}
          <div class="grade">${s.itens.map(cardProduto).join('')}</div>
        </section>`
      )
      .join('');
  }

  // ---------------------------------------------------------------- rodapé
  function renderRodape() {
    const hoje = DIAS[new Date().getDay()];
    const linhas = DIAS.slice(1)
      .concat('dom')
      .map(
        (d) =>
          `<tr${d === hoje ? ' class="hoje"' : ''}><th>${NOME_DIA[d]}</th><td>${
            L.horarios[d] ? esc(L.horarios[d].replace(/,/g, ' e ').replace(/-/g, ' às ')) : 'Fechado'
          }</td></tr>`
      )
      .join('');
    $('#rodape').innerHTML = `
      <section class="como-pedir">
        <h2>Como pedir</h2>
        <ol>
          <li>Escolha os produtos e toque em <b>Adicionar</b>.</li>
          <li>Abra o carrinho e preencha seus dados.</li>
          <li>Toque em <b>${esc(TXT.botaoComoPedir)}</b>: o WhatsApp abre com tudo escrito. É só enviar a mensagem.</li>
          ${ORC ? `<li>${esc(TXT.resposta)}</li>` : ''}
        </ol>
      </section>
      <section>
        <h2>Horário de atendimento</h2>
        ${L.horarioLivre ? `<p>${esc(L.textoHorarioLivre || 'Faça seu pedido a qualquer hora pelo site. Respondemos pelo WhatsApp.')}</p>` : `<table class="horarios">${linhas}</table>`}
      </section>
      <section>
        <h2>Onde estamos</h2>
        ${L.endereco ? `<p>${esc(L.endereco)}</p>` : ''}
        ${L.cidade ? `<p>${esc(L.cidade)}</p>` : ''}
        <p><a href="${linkWhats(L.mensagemContato || 'Olá! Vim pelo site.')}" target="_blank" rel="noopener">WhatsApp: ${esc(L.whatsappExibicao || numeroWhats)}</a></p>
        <p class="dica-ios">No iPhone, para instalar o app: toque em <b>Compartilhar</b> e depois em <b>Adicionar à Tela de Início</b>.</p>
      </section>
      <p class="assinatura">© ${new Date().getFullYear()} ${esc(L.nome)}</p>`;
  }

  // ---------------------------------------------------------------- resumo (barra inferior + badges)
  function atualizarResumo() {
    const t = totais();
    const barra = $('#barraCarrinho');
    barra.hidden = t.qtd === 0;
    $('#barraQtd').textContent = `${t.qtd} ${t.qtd === 1 ? 'item' : 'itens'}`;
    $('#barraTotal').textContent = ORC ? '' : brl(t.subtotal);
    $('#barraRotulo').textContent = TXT.verCarrinho;
    document.body.classList.toggle('com-carrinho', t.qtd > 0);

    const porProduto = {};
    carrinho.forEach((i) => (porProduto[i.id] = (porProduto[i.id] || 0) + i.qtd));
    $$('[data-badge]').forEach((el) => {
      const q = porProduto[el.dataset.badge] || 0;
      el.hidden = q === 0;
      el.textContent = q;
    });
  }

  // ---------------------------------------------------------------- modal de produto (com opções)
  function abrirProduto(id) {
    const p = produtoPorId[id];
    const dlg = $('#dlgProduto');
    const escolhas = {};
    let qtd = passo(p);

    dlg.innerHTML = `
      <form method="dialog" class="dlg">
        <header class="dlg-topo">
          <h2>${esc(p.nome)}</h2>
          <button type="button" class="fechar" aria-label="Fechar" data-fechar>✕</button>
        </header>
        <div class="dlg-corpo">
          ${p.descricao ? `<p class="descricao">${esc(p.descricao)}</p>` : ''}
          ${(p.opcoes || [])
            .map(
              (op, i) => `
            <fieldset class="opcoes">
              <legend>${esc(op.nome)} <small>(escolha 1)</small></legend>
              ${op.valores
                .map(valorOpcao)
                .map(
                  (v) => `
                <label class="opcao${v.esgotado ? ' esgotada' : ''}">
                  <input type="radio" name="op${i}" value="${esc(v.nome)}" required ${v.esgotado ? 'disabled' : ''}>
                  <span>${esc(v.nome)}</span>
                  ${v.esgotado ? '<small>esgotado</small>' : v.acrescimo && !ORC ? `<small>+ ${brl(v.acrescimo)}</small>` : ''}
                </label>`
                )
                .join('')}
            </fieldset>`
            )
            .join('')}
          <div class="qtd-linha" ${qtdNaOpcao(p) ? 'hidden' : ''}>
            <span>Quantidade</span>
            <div class="stepper">
              <button type="button" data-q="-1" aria-label="Diminuir">−</button>
              <output id="qtdProduto">${esc(qtdTexto(p, passo(p)))}</output>
              <button type="button" data-q="1" aria-label="Aumentar">+</button>
            </div>
          </div>
        </div>
        <footer class="dlg-rodape">
          <p class="erro" id="erroProduto" hidden>Escolha uma opção em cada item acima.</p>
          <button type="submit" class="btn-principal" id="btnConfirmarProduto"></button>
        </footer>
      </form>`;

    const atualizarBotao = () => {
      $('#btnConfirmarProduto', dlg).textContent = ORC ? TXT.adicionar : `Adicionar • ${brl(precoUnitario(p, escolhas) * qtd)}`;
      $('#qtdProduto', dlg).textContent = qtdTexto(p, qtd);
    };

    (p.opcoes || []).forEach((op, i) => {
      $$(`input[name="op${i}"]`, dlg).forEach((r) =>
        r.addEventListener('change', () => {
          escolhas[op.nome] = r.value;
          $('#erroProduto', dlg).hidden = true;
          atualizarBotao();
        })
      );
    });
    $$('[data-q]', dlg).forEach((b) =>
      b.addEventListener('click', () => {
        qtd = Math.max(passo(p), qtd + Number(b.dataset.q) * passo(p));
        atualizarBotao();
      })
    );
    $('[data-fechar]', dlg).addEventListener('click', () => dlg.close());
    $('form', dlg).addEventListener('submit', (e) => {
      const faltando = (p.opcoes || []).some((op) => !escolhas[op.nome]);
      if (faltando) {
        e.preventDefault();
        $('#erroProduto', dlg).hidden = false;
        return;
      }
      // mantém a ordem das opções como no config
      const ordenadas = {};
      (p.opcoes || []).forEach((op) => (ordenadas[op.nome] = escolhas[op.nome]));
      adicionar(p.id, ordenadas, qtd);
    });

    atualizarBotao();
    dlg.showModal();
  }

  // ---------------------------------------------------------------- carrinho / checkout
  const descricaoEscolhas = (e) =>
    Object.entries(e || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

  function renderItensCarrinho() {
    const lista = $('#listaItens');
    if (!lista) return;
    if (!carrinho.length) {
      lista.innerHTML = '<p class="vazio">Seu carrinho está vazio.</p>';
    } else {
      lista.innerHTML = carrinho
        .map((i) => {
          const p = produtoPorId[i.id];
          const det = descricaoEscolhas(i.escolhas);
          return `
          <div class="item">
            <div class="item-info">
              <strong>${esc(p.nome)}</strong>
              ${det ? `<small>${esc(det)}</small>` : ''}
              ${ORC ? '' : `<span class="item-preco">${brl(i.preco * i.qtd)}</span>`}
            </div>
            ${
              qtdNaOpcao(p)
                ? `<button type="button" class="btn-remover" data-item="${esc(i.chave)}" data-d="-${i.qtd}" aria-label="Remover">🗑 Remover</button>`
                : `<div class="stepper">
              <button type="button" data-item="${esc(i.chave)}" data-d="-${passo(p)}" aria-label="Diminuir">${i.qtd <= passo(p) ? '🗑' : '−'}</button>
              <output>${esc(qtdTexto(p, i.qtd))}</output>
              <button type="button" data-item="${esc(i.chave)}" data-d="${passo(p)}" aria-label="Aumentar">+</button>
            </div>`
            }
          </div>`;
        })
        .join('');
    }
    $$('[data-item]', lista).forEach((b) => b.addEventListener('click', () => alterarQtd(b.dataset.item, Number(b.dataset.d))));
    renderTotais();
  }

  // Doces com "lote" precisam fechar centos completos (regraCento.tamanho)
  function statusCento() {
    const rc = L.regraCento;
    if (!rc) return null;
    const un = carrinho.reduce((s, i) => s + (produtoPorId[i.id].lote ? i.qtd * produtoPorId[i.id].lote : 0), 0);
    if (!un) return null;
    const resto = un % rc.tamanho;
    return { un, falta: resto ? rc.tamanho - resto : 0 };
  }

  function renderTotais() {
    if (ORC) {
      $('#totais').innerHTML = `<p class="dica">${esc(L.textoOrcamento || 'O valor é enviado pelo WhatsApp, junto com a confirmação da data.')}</p>`;
      const b = $('#btnEnviar');
      if (b) b.disabled = !carrinho.length;
      return;
    }
    const t = totais();
    const min = L.entrega.pedidoMinimo || 0;
    const abaixoMinimo = min > 0 && t.subtotal < min;
    const cento = statusCento();
    const centoIncompleto = !!(cento && cento.falta);
    $('#totais').innerHTML = `
      <div><span>Subtotal</span><span>${brl(t.subtotal)}</span></div>
      ${dados.tipo === 'entrega' ? `<div><span>Taxa de entrega</span><span>${(L.entrega.bairros || []).length && !dados.bairro ? 'escolha o bairro' : t.taxa ? brl(t.taxa) : 'Grátis'}</span></div>` : ''}
      <div class="total"><span>Total</span><span>${brl(t.total)}</span></div>
      ${L.sinal ? `<div><span>Sinal ${Math.round(L.sinal * 100)}% (reserva a data)</span><span>${brl(t.total * L.sinal)}</span></div>
      <div><span>${esc(L.textoRestante || 'Restante')}</span><span>${brl(t.total * (1 - L.sinal))}</span></div>` : ''}
      ${centoIncompleto ? `<p class="erro">${esc(L.regraCento.aviso || 'Os doces são vendidos por cento.')} Você escolheu ${cento.un} doces: faltam ${cento.falta} para completar.</p>` : ''}
      ${abaixoMinimo ? `<p class="erro">Pedido mínimo: ${brl(min)}. Faltam ${brl(min - t.subtotal)}.</p>` : ''}`;
    const btn = $('#btnEnviar');
    if (btn) btn.disabled = !carrinho.length || abaixoMinimo || centoIncompleto;
  }

  function dataMinima() {
    const d = new Date();
    d.setDate(d.getDate() + (L.encomenda.antecedenciaDias || 0));
    return d.toISOString().slice(0, 10);
  }

  function abrirCarrinho() {
    const dlg = $('#dlgCarrinho');
    const tipos = tiposEntrega();
    if (!tipos.find((t) => t.id === dados.tipo)) dados.tipo = tipos.length === 1 ? tipos[0].id : '';
    const bairros = L.entrega.bairros || [];
    const enc = L.encomenda || {};

    dlg.innerHTML = `
      <form class="dlg" id="formPedido" novalidate>
        <header class="dlg-topo">
          <h2>${esc(TXT.seu)}</h2>
          <button type="button" class="fechar" aria-label="Fechar" data-fechar>✕</button>
        </header>
        <div class="dlg-corpo">
          <div id="listaItens"></div>

          <h3>Seus dados</h3>
          <label class="campo">Seu nome *
            <input name="nome" autocomplete="name" required value="${esc(dados.nome)}">
          </label>

          ${
            tipos.length > 1
              ? `<fieldset class="opcoes">
                  <legend>Como prefere receber? *</legend>
                  ${tipos
                    .map(
                      (t) => `
                    <label class="opcao"><input type="radio" name="tipo" value="${t.id}" required ${dados.tipo === t.id ? 'checked' : ''}><span>${esc(t.nome)}</span></label>`
                    )
                    .join('')}
                </fieldset>`
              : `<p class="info-entrega">${esc(tipos[0].nome)}</p>`
          }

          <div id="blocoEntrega" ${dados.tipo === 'entrega' ? '' : 'hidden'}>
            ${
              bairros.length
                ? `<label class="campo">Bairro *
                    <select name="bairro" required>
                      <option value="">Selecione</option>
                      ${bairros.map((b) => `<option ${dados.bairro === b.nome ? 'selected' : ''} value="${esc(b.nome)}">${esc(b.nome)} — ${b.taxa ? brl(b.taxa) : 'grátis'}</option>`).join('')}
                    </select>
                  </label>`
                : ''
            }
            <label class="campo">Endereço (rua, número, complemento) *
              <input name="endereco" autocomplete="street-address" required value="${esc(dados.endereco)}">
            </label>
            <label class="campo">Ponto de referência
              <input name="referencia" value="${esc(dados.referencia)}">
            </label>
            ${L.entrega.observacao ? `<p class="dica">${esc(L.entrega.observacao)}</p>` : ''}
          </div>

          ${
            enc.exigeData
              ? `<div class="linha-2">
                  <label class="campo">${esc(enc.rotuloData || 'Para que dia?')} *
                    <input type="date" name="data" required min="${dataMinima()}" value="${esc(dados.data)}">
                  </label>
                  <label class="campo">Horário
                    <input type="time" name="hora" value="${esc(dados.hora)}">
                  </label>
                </div>
                ${enc.aviso ? `<p class="dica">${esc(enc.aviso)}</p>` : ''}`
              : ''
          }

          ${extras
            .map(
              (c) => `
            <label class="campo">${esc(c.rotulo)}${c.obrigatorio ? ' *' : ''}
              <input name="${esc(c.nome)}" type="${c.tipo === 'number' ? 'number' : 'text'}" ${c.tipo === 'number' ? 'inputmode="numeric" min="1"' : ''} placeholder="${esc(c.exemplo || '')}" value="${esc(dados[c.nome])}">
            </label>`
            )
            .join('')}

          ${
            ORC || !L.pagamentos.length
              ? ''
              : `
          <fieldset class="opcoes">
            <legend>Forma de pagamento *</legend>
            ${L.pagamentos
              .map(
                (pg) => `
              <label class="opcao"><input type="radio" name="pagamento" value="${esc(pg)}" required ${dados.pagamento === pg ? 'checked' : ''}><span>${esc(pg)}</span></label>`
              )
              .join('')}
          </fieldset>
          <label class="campo" id="blocoTroco" ${/dinheiro/i.test(dados.pagamento) ? '' : 'hidden'}>Troco para quanto?
            <input name="troco" inputmode="decimal" placeholder="Ex.: 50" value="${esc(dados.troco)}">
          </label>
`
          }

          <label class="campo">Observações
            <textarea name="obs" rows="2" placeholder="${esc(L.placeholderObs || 'Algum detalhe sobre o pedido?')}">${esc(dados.obs)}</textarea>
          </label>

          <div id="totais" class="totais"></div>
        </div>
        <footer class="dlg-rodape">
          <p class="erro" id="erroPedido" hidden></p>
          <button type="submit" class="btn-principal btn-whats" id="btnEnviar">${esc(TXT.enviar)}</button>
        </footer>
      </form>`;

    const form = $('#formPedido', dlg);
    form.addEventListener('input', (e) => {
      const { name, value } = e.target;
      if (!(name in dados)) return;
      dados[name] = value;
      if (name === 'tipo') $('#blocoEntrega', dlg).hidden = value !== 'entrega';
      if (name === 'pagamento') $('#blocoTroco', dlg).hidden = !/dinheiro/i.test(value);
      if (['tipo', 'bairro'].includes(name)) renderTotais();
      $('#erroPedido', dlg).hidden = true;
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      enviarPedido(dlg);
    });
    $('[data-fechar]', dlg).addEventListener('click', () => dlg.close());

    renderItensCarrinho();
    dlg.showModal();
  }

  function validar() {
    const faltas = [];
    if (!dados.nome.trim()) faltas.push('seu nome');
    if (!dados.tipo) faltas.push('como prefere receber');
    if (dados.tipo === 'entrega') {
      if ((L.entrega.bairros || []).length && !dados.bairro) faltas.push('o bairro');
      if (!dados.endereco.trim()) faltas.push('o endereço');
    }
    if (L.encomenda.exigeData) {
      if (!dados.data) faltas.push('a data');
      else if (dados.data < dataMinima()) faltas.push(`uma data a partir de ${formatarData(dataMinima())}`);
    }
    extras.forEach((c) => c.obrigatorio && !String(dados[c.nome]).trim() && faltas.push(c.rotulo.toLowerCase()));
    if (!ORC && L.pagamentos.length && !dados.pagamento) faltas.push('a forma de pagamento');
    const cento = statusCento();
    if (cento && cento.falta) faltas.push(`mais ${cento.falta} doces para completar o cento`);
    if (!ORC && /dinheiro/i.test(dados.pagamento) && dados.troco.trim()) {
      const troco = Number(dados.troco.replace(/[^\d,.]/g, '').replace(/\.(?=\d{3})/g, '').replace(',', '.'));
      if (!troco || troco < totais().total) faltas.push(`um troco maior que o total (${brl(totais().total)})`);
    }
    return faltas;
  }

  const formatarData = (iso) => {
    const [a, m, d] = iso.split('-');
    const dia = new Date(Number(a), Number(m) - 1, Number(d));
    return `${d}/${m}/${a} (${NOME_DIA[DIAS[dia.getDay()]]})`;
  };

  function numeroPedido() {
    const d = new Date();
    const p2 = (n) => String(n).padStart(2, '0');
    return `${p2(d.getDate())}${p2(d.getMonth() + 1)}-${p2(d.getHours())}${p2(d.getMinutes())}`;
  }

  function montarMensagem(numero) {
    const t = totais();
    const linhas = [];
    linhas.push(`*${TXT.titulo} — ${L.nome}*`);
    linhas.push(`${TXT.numero} nº ${numero}`);
    if (!abertoAgora()) linhas.push('_(enviado fora do horário de atendimento)_');
    linhas.push('');
    linhas.push(`*Cliente:* ${dados.nome.trim()}`);
    if (dados.tipo === 'entrega') {
      linhas.push('*Receber:* Entrega');
      linhas.push(`*Endereço:* ${dados.endereco.trim()}${dados.bairro ? ' — ' + dados.bairro : ''}`);
      if (dados.referencia.trim()) linhas.push(`*Referência:* ${dados.referencia.trim()}`);
    } else {
      linhas.push(`*Receber:* ${L.entrega.textoRetirada || 'Retirar no local'}`);
    }
    if (L.encomenda.exigeData && dados.data) {
      linhas.push(`*Para:* ${formatarData(dados.data)}${dados.hora ? ' às ' + dados.hora : ''}`);
    }
    extras.forEach((c) => String(dados[c.nome]).trim() && linhas.push(`*${c.rotulo}:* ${String(dados[c.nome]).trim()}`));
    linhas.push('');
    linhas.push('*Itens:*');
    carrinho.forEach((i) => {
      const p = produtoPorId[i.id];
      const det = descricaoEscolhas(i.escolhas);
      linhas.push(`• ${p.lote ? qtdTexto(p, i.qtd) + ' ' : qtdNaOpcao(p) && i.qtd === 1 ? '' : i.qtd + 'x '}${p.nome}${det ? ' (' + det + ')' : ''}${ORC ? '' : ' — ' + brl(i.preco * i.qtd)}`);
    });
    if (!ORC) {
      linhas.push('');
      linhas.push(`Subtotal: ${brl(t.subtotal)}`);
      if (dados.tipo === 'entrega') linhas.push(`Entrega: ${t.taxa ? brl(t.taxa) : 'grátis'}`);
      linhas.push(`*TOTAL: ${brl(t.total)}*`);
      if (L.sinal) {
        linhas.push(`Sinal ${Math.round(L.sinal * 100)}% para reservar a data: ${brl(t.total * L.sinal)}`);
        linhas.push(`${L.textoRestante || 'Restante'}: ${brl(t.total * (1 - L.sinal))}`);
      }
      if (dados.pagamento) {
        linhas.push('');
        linhas.push(`*Pagamento:* ${dados.pagamento}${/dinheiro/i.test(dados.pagamento) && dados.troco.trim() ? ' — troco para R$ ' + dados.troco.trim() : ''}`);
      }
    }
    if (dados.obs.trim()) linhas.push(`*Observações:* ${dados.obs.trim()}`);
    if (L.rodapeMensagem) {
      linhas.push('');
      linhas.push(L.rodapeMensagem);
    }
    return linhas.join('\n');
  }

  function enviarPedido(dlg) {
    const faltas = validar();
    const erro = $('#erroPedido', dlg);
    if (faltas.length) {
      erro.textContent = 'Falta informar: ' + faltas.join(', ') + '.';
      erro.hidden = false;
      return;
    }
    const numero = numeroPedido();
    const url = linkWhats(montarMensagem(numero));
    salvarCliente();

    // Não limpamos o carrinho sozinhos: a pessoa pode desistir no WhatsApp.
    $('.dlg-corpo', dlg).innerHTML = `
      <div class="sucesso">
        <div class="sucesso-icone" aria-hidden="true">✅</div>
        <h3>Quase lá!</h3>
        <p>O WhatsApp foi aberto com ${esc(TXT.oItem)} nº <b>${esc(numero)}</b> já escrito.</p>
        <p><b>Confira e toque em enviar</b> dentro do WhatsApp para ${esc(TXT.oItem)} chegar até nós.</p>
        ${L.pix && /pix/i.test(dados.pagamento) ? `<p class="pix">Chave Pix: <b>${esc(L.pix)}</b><br><small>Envie o comprovante na conversa.</small></p>` : ''}
        <p><a class="link" href="${url}" target="_blank" rel="noopener">O WhatsApp não abriu? Toque aqui.</a></p>
      </div>`;
    $('.dlg-rodape', dlg).innerHTML = `
      <button type="button" class="btn-principal" id="btnConcluir">Já enviei — limpar carrinho</button>
      <button type="button" class="btn-secundario" data-fechar>Voltar</button>`;
    $('#btnConcluir', dlg).addEventListener('click', () => {
      carrinho = [];
      salvarCarrinho();
      atualizarResumo();
      dlg.close();
      toast(TXT.obrigado);
    });
    $('[data-fechar]', dlg).addEventListener('click', () => dlg.close());

    const janela = window.open(url, '_blank');
    if (!janela) window.location.href = url;
  }

  // ---------------------------------------------------------------- toast
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('visivel');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('visivel'), 2200);
  }

  // ---------------------------------------------------------------- instalação (PWA)
  let eventoInstalar = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    eventoInstalar = e;
    const b = $('#btnInstalar');
    if (b) b.hidden = false;
  });

  // ---------------------------------------------------------------- início
  function iniciar() {
    aplicarTema();
    renderTopo();
    renderCardapio();
    renderRodape();
    atualizarResumo();

    $('#whatsFlutuante').href = linkWhats(L.mensagemContato || 'Olá! Vim pelo site.');

    document.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      if (add) {
        const p = produtoPorId[add.dataset.add];
        if ((p.opcoes || []).length) abrirProduto(p.id);
        else adicionar(p.id, {}, passo(p));
        return;
      }
      if (e.target.closest('#btnInstalar') && eventoInstalar) {
        eventoInstalar.prompt();
        eventoInstalar = null;
        e.target.closest('#btnInstalar').hidden = true;
      }
    });
    $('#barraCarrinho').addEventListener('click', abrirCarrinho);

    // fecha modal ao tocar fora
    $$('dialog').forEach((d) =>
      d.addEventListener('click', (e) => {
        if (e.target === d) d.close();
      })
    );

    // atualiza "aberto/fechado" a cada minuto
    setInterval(renderTopo, 60000);

    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  iniciar();
})();
