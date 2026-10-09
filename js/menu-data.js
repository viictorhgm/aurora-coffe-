/* Conteúdo editável da Aurora Coffee: cardápio e horários.
   Preços em reais. Para trocar uma foto, use outro ID de imagem do Unsplash
   ou um caminho local (ex.: "assets/fotos/latte.jpg"). */

window.AURORA = {
  // 0 = domingo … 6 = sábado. Horários em "HH:MM"; null = fechado.
  hours: {
    0: ["08:00", "14:00"],
    1: ["07:00", "19:00"],
    2: ["07:00", "19:00"],
    3: ["07:00", "19:00"],
    4: ["07:00", "19:00"],
    5: ["07:00", "19:00"],
    6: ["08:00", "18:00"],
  },

  // Tempo mínimo de preparo para retirada (minutos) e intervalo entre horários.
  pickup: { leadMinutes: 15, stepMinutes: 15, lastBeforeCloseMinutes: 15 },

  categories: [
    {
      id: "espresso",
      name: "Espresso & leite",
      description: "Blend da casa: Cerrado Mineiro, notas de chocolate e caramelo.",
      items: [
        { id: "espresso", name: "Espresso", desc: "Dose de 30 ml, extraída em 27 segundos.", price: 7 },
        { id: "cortado", name: "Cortado", desc: "Espresso com um pouco de leite vaporizado.", price: 9 },
        { id: "cappuccino", name: "Cappuccino", desc: "Espresso duplo, leite vaporizado e espuma fina. 180 ml.", price: 14,
          photo: "1572442388796-11668a67e53d", alt: "Cappuccino com desenho de folha em xícara branca" },
        { id: "flatwhite", name: "Flat white", desc: "Duplo ristretto com leite cremoso, menos espuma. 160 ml.", price: 15 },
        { id: "latte-aurora", name: "Latte Aurora", desc: "Nosso latte com mel de laranjeira e canela torrada.", price: 16, tag: "Da casa",
          photo: "1509042239860-f550ce710b93", alt: "Dois lattes com arte no leite em uma mesa" },
        { id: "mocha", name: "Mocha", desc: "Espresso, chocolate 70% derretido e leite vaporizado.", price: 17 },
      ],
    },
    {
      id: "filtrados",
      name: "Filtrados",
      description: "A origem da semana, coada na hora. Pergunte qual está na moenda.",
      items: [
        { id: "v60", name: "V60 do dia", desc: "Coado em cone, 250 ml. Leve e aromático.", price: 16,
          photo: "1498804103079-a6351b050096", alt: "Xícaras de café vistas de cima ao redor de uma mesa de madeira" },
        { id: "chemex", name: "Chemex para dois", desc: "500 ml servidos na jarra, para dividir.", price: 26 },
        { id: "prensa", name: "Prensa francesa", desc: "Mais corpo, 300 ml. Ótimo com a fornada doce.", price: 15 },
        { id: "aeropress", name: "Aeropress", desc: "Concentrado e limpo, 200 ml.", price: 15 },
      ],
    },
    {
      id: "gelados",
      name: "Gelados",
      description: "Feitos com café extraído a frio por 18 horas.",
      items: [
        { id: "coldbrew", name: "Cold brew", desc: "Puro, com gelo. 300 ml.", price: 15 },
        { id: "iced-latte", name: "Iced latte", desc: "Espresso duplo, leite gelado e gelo. 350 ml.", price: 16,
          photo: "1461023058943-07fcbe16d735", alt: "Copo de iced latte com camadas de café e leite" },
        { id: "tonica", name: "Tônica de café", desc: "Água tônica, cold brew e casca de laranja.", price: 18, tag: "Da casa" },
        { id: "mocha-gelado", name: "Mocha gelado", desc: "Chocolate 70%, cold brew e leite.", price: 19,
          photo: "1517701604599-bb29b565090c", alt: "Mocha gelado em copo de vidro sobre mesa de madeira" },
      ],
    },
    {
      id: "padaria",
      name: "Padaria",
      description: "Fermentação natural e manteiga de verdade. Primeira fornada às 6h30.",
      items: [
        { id: "croissant", name: "Croissant de manteiga", desc: "Folhado, 72 horas de preparo.", price: 12,
          photo: "1555507036-ab1f4038808a", alt: "Croissants dourados sobre superfície escura" },
        { id: "pao-queijo", name: "Pão de queijo (3 un.)", desc: "Queijo canastra meia-cura.", price: 10, tag: "Sem glúten" },
        { id: "bolo-laranja", name: "Bolo de laranja", desc: "Fatia com calda de laranja-pera.", price: 11 },
        { id: "cookie", name: "Cookie de chocolate", desc: "Chocolate 70% e flor de sal.", price: 9 },
        { id: "focaccia", name: "Focaccia de tomate", desc: "Sanduíche com tomate assado, burrata e manjericão.", price: 28, tag: "Vegetariano" },
        { id: "granola", name: "Iogurte com granola", desc: "Granola da casa, mel e frutas da estação.", price: 19 },
      ],
    },
  ],
};
