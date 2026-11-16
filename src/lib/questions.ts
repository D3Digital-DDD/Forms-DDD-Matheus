// Fonte única das perguntas do formulário DDD Private.
// Para mudar textos ou opções, edite só este arquivo.

export type ChoiceQuestion = {
  id: string;
  title: string;
  hint?: string;
  options: readonly string[];
};

export const OPERATION_QUESTION = {
  id: "tem_operacao",
  title: "Você já tem uma operação de e‑commerce rodando?",
  options: ["Sim, já tenho operação", "Ainda não tenho"],
} as const satisfies ChoiceQuestion;

export type Path = "com_operacao" | "sem_operacao";

export function pathFromAnswer(answer: string): Path {
  return answer === OPERATION_QUESTION.options[0] ? "com_operacao" : "sem_operacao";
}

const TIMING: ChoiceQuestion = {
  id: "quando_comecar",
  title: "Quando você quer começar?",
  options: ["Imediatamente", "Nos próximos 30 dias", "Em 2 a 3 meses"],
};

const cash = (context: string): ChoiceQuestion => ({
  id: "caixa_investimento",
  title: `Como está o seu caixa disponível para investir ${context} hoje?`,
  options: ["Menos de R$ 10 mil", "+ R$ 10 mil", "+ R$ 25 mil", "+ R$ 50 mil", "+ R$ 100 mil"],
});

export const BRANCHES: Record<Path, readonly ChoiceQuestion[]> = {
  com_operacao: [
    {
      id: "faturamento",
      title: "Qual é o faturamento mensal médio da sua operação?",
      options: [
        "Até R$ 10 mil",
        "R$ 10 mil a R$ 50 mil",
        "R$ 50 mil a R$ 200 mil",
        "R$ 200 mil a R$ 1 milhão",
        "Acima de R$ 1 milhão",
      ],
    },
    {
      id: "canal",
      title: "Onde você vende hoje?",
      options: [
        "Loja própria (Shopify, Nuvemshop…)",
        "Marketplaces (Mercado Livre, Shopee, Amazon…)",
        "Loja própria e marketplaces",
      ],
    },
    {
      id: "gargalo",
      title: "Qual é o maior gargalo da sua operação hoje?",
      options: [
        "Tráfego e aquisição de clientes",
        "Conversão e ticket médio",
        "Margem, logística e operação",
        "Escala: time, processos e gestão",
      ],
    },
    TIMING,
    cash("na sua operação"),
  ],
  sem_operacao: [
    {
      id: "momento",
      title: "Qual é o seu momento atual?",
      options: [
        "Sou CLT e quero empreender",
        "Sou empresário em outro setor",
        "Já tentei e-commerce e parei",
        "Estou começando do zero",
      ],
    },
    {
      id: "objetivo",
      title: "O que você busca com o e‑commerce?",
      options: [
        "Uma renda extra",
        "Construir meu negócio principal",
        "Diversificar os negócios que já tenho",
        "Criar uma marca própria",
      ],
    },
    {
      id: "tempo_semanal",
      title: "Quanto tempo por semana você pode dedicar?",
      options: ["Menos de 10 horas", "10 a 20 horas", "20 a 40 horas", "Dedicação integral"],
    },
    TIMING,
    cash("no seu novo negócio"),
  ],
};

// nome + whatsapp + pergunta de operação + 5 da ramificação
export const TOTAL_STEPS = 3 + BRANCHES.com_operacao.length;
