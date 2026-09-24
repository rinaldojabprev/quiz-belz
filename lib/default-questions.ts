import { QuizQuestion } from './types';

export const DEFAULT_BELZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'belz-q1',
    question: 'Qual é o principal objetivo do seguro de Responsabilidade Civil (RC)?',
    options: [
      'Garantir indenização por danos involuntários causados a terceiros',
      'Cobrir apenas despesas médicas do titular do seguro',
      'Financiar a aquisição de novos maquinários industriais',
      'Proteger exclusivamente contra oscilações cambiais'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Seguros Gerais'
  },
  {
    id: 'belz-q2',
    question: 'No mercado segurador, o que é a "Franquia"?',
    options: [
      'A comissão paga ao corretor de seguros',
      'A participação obrigatória do segurado no pagamento do sinistro',
      'O desconto concedido na renovação por ausência de sinistro',
      'O limite máximo de cobertura garantido na apólice'
    ],
    correctAnswer: 1,
    points: 100,
    category: 'Conceitos'
  },
  {
    id: 'belz-q3',
    question: 'Qual é o órgão governamental responsável pela regulação do mercado de seguros privados no Brasil?',
    options: [
      'SUSEP (Superintendência de Seguros Privados)',
      'ANVISA (Agência Nacional de Vigilância Sanitária)',
      'BACEN (Banco Central do Brasil)',
      'CVM (Comissão de Valores Mobiliários)'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Regulação'
  },
  {
    id: 'belz-q4',
    question: 'O Seguro D&O (Directors and Officers) protege especificamente quem?',
    options: [
      'Clientes que compram produtos defeituosos da empresa',
      'Executivos e administradores contra processos por atos de gestão',
      'Funcionários operacionais em acidentes de trabalho',
      'Fornecedores que não receberam pagamentos contratuais'
    ],
    correctAnswer: 1,
    points: 100,
    category: 'Seguros Corporativos'
  },
  {
    id: 'belz-q5',
    question: 'Qual é a diferença fundamental entre PGBL e VGBL na previdência privada?',
    options: [
      'O VGBL permite dedução do imposto de renda até 12% da renda bruta anual',
      'O PGBL permite deduzir aportes no IR na declaração completa',
      'O PGBL nunca cobra taxa de administração',
      'O VGBL é exclusivo para servidores públicos federais'
    ],
    correctAnswer: 1,
    points: 100,
    category: 'Previdência'
  },
  {
    id: 'belz-q6',
    question: 'O que caracteriza o Seguro Garantia?',
    options: [
      'Garante que o produto comprado terá garantia estendida de fábrica',
      'Garante o cumprimento de obrigações contratuais assumidas',
      'Garante apenas a reposição de veículos furtados',
      'Garante o retorno financeiro garantido em fundos de ações'
    ],
    correctAnswer: 1,
    points: 100,
    category: 'Garantias'
  },
  {
    id: 'belz-q7',
    question: 'Em caso de sinistro com perda total em automóvel, o que costuma ser tomado como referência de valor?',
    options: [
      'Tabela FIPE oficial da data da liquidação do sinistro',
      'O valor da nota fiscal de compra original independente do ano',
      'O valor estimado arbitrariamente pela oficina mecânica',
      'Apenas o valor pago no IPVA do ano corrente'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Auto'
  },
  {
    id: 'belz-q8',
    question: 'Qual destes NÃO é um pilar da gestão de riscos corporativos?',
    options: [
      'Identificação de vulnerabilidades',
      'Mitigação e transferência de riscos',
      'Ignorar riscos improváveis para reduzir custos',
      'Monitoramento contínuo dos cenários'
    ],
    correctAnswer: 2,
    points: 100,
    category: 'Gestão de Risco'
  },
  {
    id: 'belz-q9',
    question: 'O que cobre a cobertura de Lucros Cessantes em uma apólice empresarial?',
    options: [
      'A perda do faturamento/lucro líquido decorrente de sinistro coberto',
      'Multas por atraso de pagamento de salários',
      'Prejuízos causados por má gestão de marketing',
      'A compra de novas ações na Bolsa de Valores'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Empresarial'
  },
  {
    id: 'belz-q10',
    question: 'Em um seguro de Vida, quem pode ser indicado como beneficiário?',
    options: [
      'Exclusivamente parentes de primeiro grau consanguíneo',
      'Qualquer pessoa física escolhida livremente pelo segurado',
      'Apenas o cônjuge legalmente casado em comunhão universal',
      'Somente instituições de caridade cadastradas'
    ],
    correctAnswer: 1,
    points: 100,
    category: 'Vida'
  },
  {
    id: 'belz-q11',
    question: 'Qual é a principal função de uma Corretora de Seguros consultiva como a Belz?',
    options: [
      'Apenas emitir faturas e boletos mensais',
      'Analisar necessidades, desenhar soluções sob medida e defender o segurado',
      'Reter as indenizações pagas pelas seguradoras',
      'Reparar veículos diretamente em oficinas próprias'
    ],
    correctAnswer: 1,
    points: 100,
    category: 'Belz'
  },
  {
    id: 'belz-q12',
    question: 'O que é o "Prêmio" no vocabulário técnico de seguros?',
    options: [
      'O bônus em dinheiro que o segurado ganha ao final do ano',
      'O valor financeiro pago pelo segurado para obter a proteção do seguro',
      'A indenização paga pela seguradora quando ocorre o sinistro',
      'O troféu entregue ao melhor corretor do mês'
    ],
    correctAnswer: 1,
    points: 100,
    category: 'Conceitos'
  },
  {
    id: 'belz-q13',
    question: 'Qual destes riscos é protegido pelo Seguro Cyber (Riscos Cibernéticos)?',
    options: [
      'Danos por vazamento de dados da LGPD e ataques de ransomware',
      'Queima do monitor por café derramado acidentalmente',
      'Falta de energia elétrica por temporal na cidade',
      'Compra de software pirata por um colaborador'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Cyber'
  },
  {
    id: 'belz-q14',
    question: 'O que define a "Apólice" de seguro?',
    options: [
      'O contrato formal emitido pela seguradora que formaliza a proteção',
      'O orçamento prévio não vinculativo enviado por e-mail',
      'O comprovante de quitação da primeira parcela',
      'O manual de instruções do fabricante do bem'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Conceitos'
  },
  {
    id: 'belz-q15',
    question: 'O que significa a sigla "LMG" em seguros de grandes riscos e patrimoniais?',
    options: [
      'Limite Máximo de Garantia',
      'Laudo Mínimo de Gerenciamento',
      'Licença Municipal Geral',
      'Linha de Manutenção Garantida'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Técnico'
  },
  {
    id: 'belz-q16',
    question: 'No Seguro Saúde Coletivo Empresarial, o que é o índice de "Sinistralidade"?',
    options: [
      'A relação percentual entre os custos assistenciais usados e o valor pago',
      'O total de vidas cadastradas no plano que nunca foram ao médico',
      'A pontualidade do pagamento dos boletos pela empresa',
      'A nota média de satisfação dos hospitais credenciados'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Saúde'
  },
  {
    id: 'belz-q17',
    question: 'Qual é o nome do documento que formaliza o pedido de contratação pelo cliente antes da emissão da apólice?',
    options: [
      'Proposta de Seguro',
      'Endosso de Cancelamento',
      'Aviso de Sinistro',
      'Regulamento Geral de Prêmios'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Operacional'
  },
  {
    id: 'belz-q18',
    question: 'O que é um "Endosso" em uma apólice de seguro existente?',
    options: [
      'Um instrumento que altera dados ou coberturas de uma apólice em vigor',
      'A recusa definitiva de pagamento de uma indenização',
      'A troca compulsória de corretora pelo segurado',
      'O comprovante anual de quitação do IPVA'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Operacional'
  },
  {
    id: 'belz-q19',
    question: 'No Seguro de Transporte de Cargas, qual é a apólice obrigatória para o transportador rodoviário de carga?',
    options: [
      'RCTR-C (Responsabilidade Civil do Transportador Rodoviário de Carga)',
      'Seguro DPVAT exclusivo interestadual',
      'Seguro Fiança Locatícia de Carretas',
      'Seguro Viagem Executivo'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Transporte'
  },
  {
    id: 'belz-q20',
    question: 'Qual é o benefício do "Resseguro" para o sistema financeiro e de seguros?',
    options: [
      'Permite que as seguradoras transfiram parte de riscos vultosos a resseguradores',
      'Permite ao cliente contratar dois seguros idênticos para lucrar o dobro',
      'Isenta as empresas de pagarem tributos federais',
      'Impede que pessoas físicas contratem seguros sem fiador'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Mercado'
  },
  {
    id: 'belz-q21',
    question: 'Em seguro residencial, qual cobertura básica é historicamente obrigatória?',
    options: [
      'Incêndio, Queda de Raio e Explosão',
      'Quebra de vidros e mármores',
      'Vazamento de tubulações de água fria',
      'Danos elétricos em eletrodomésticos'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Residencial'
  },
  {
    id: 'belz-q22',
    question: 'O que é a "Carência" em um plano de saúde ou seguro de vida?',
    options: [
      'O período de tempo após o início do contrato em que certas coberturas não podem ser acionadas',
      'O desconto especial oferecido para novos clientes',
      'A tolerância em dias para pagar a fatura em atraso sem multa',
      'A ausência de hospitais credenciados na cidade do segurado'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Conceitos'
  },
  {
    id: 'belz-q23',
    question: 'Qual dos seguintes seguros é frequentemente utilizado para substituir o fiador no aluguel de imóveis?',
    options: [
      'Seguro Fiança Locatícia',
      'Seguro Prestamista',
      'Seguro Habitacional SFH',
      'Seguro D&O'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Patrimonial'
  },
  {
    id: 'belz-q24',
    question: 'O que o Seguro Prestamista garante?',
    options: [
      'A quitação ou amortização de uma dívida em caso de morte ou invalidez do segurado',
      'Empréstimos com juros zero para compra de automóveis',
      'A garantia de pontualidade no pagamento de fornecedores internacionais',
      'O reembolso de despesas com combustível'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Crédito'
  },
  {
    id: 'belz-q25',
    question: 'O que significa o termo "Sinistro" no setor de seguros?',
    options: [
      'A ocorrência de evento danoso previsto no contrato que aciona a cobertura',
      'Um corretor com atitude suspeita',
      'Uma cláusula nula que invalida a apólice',
      'O cancelamento da apólice por falta de pagamento'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Conceitos'
  },
  {
    id: 'belz-q26',
    question: 'Em seguros rurais/agrícolas, qual evento comum NÃO costuma ser risco coberto na apólice multirrisco padrão sem cobertura específica?',
    options: [
      'Desvalorização do preço da commodity na bolsa futura',
      'Geada extrema na lavoura',
      'Granizo destruidor',
      'Seca prolongada comprovada por laudo'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Agrícola'
  },
  {
    id: 'belz-q27',
    question: 'O que é a "Classe de Bônus" no seguro de automóvel?',
    options: [
      'Um sistema de pontuação que concede descontos ao segurado a cada ano renovado sem sinistros',
      'A categoria de luxo do veículo na tabela de fabricação',
      'O limite de velocidade permitido na apólice',
      'A quantidade de condutores menores de 25 anos autorizados'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Auto'
  },
  {
    id: 'belz-q28',
    question: 'Qual é o papel do "Perito / Regulador de Sinistros"?',
    options: [
      'Averiguar as causas, circunstâncias e extensão dos prejuízos do evento',
      'Vender novas coberturas no momento do acidente',
      'Cobrar judicialmente a franquia do terceiro',
      'Determinar o valor do IPVA do ano seguinte'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Sinistro'
  },
  {
    id: 'belz-q29',
    question: 'O que caracteriza a cobertura de Responsabilidade Civil Ambiental?',
    options: [
      'Reparação de danos causados ao meio ambiente por poluição súbita ou acidental',
      'Plantio obrigatório de árvores na sede da corretora',
      'Isenção de multas do IBAMA por crimes premeditados',
      'Financiamento de painéis solares residenciais'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Ambiental'
  },
  {
    id: 'belz-q30',
    question: 'No Grupo Belz, qual é o valor prioritário no atendimento ao cliente e parceiro?',
    options: [
      'Transparência, agilidade consultiva e segurança no relacionamento de longo prazo',
      'Vender o produto mais caro independente da necessidade do cliente',
      'Dificultar o acionamento de sinistros para reduzir custos',
      'Atender apenas grandes multinacionais'
    ],
    correctAnswer: 0,
    points: 100,
    category: 'Belz'
  }
];
