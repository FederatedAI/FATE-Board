const defaultColor = [
  [
    '#494ece',
    '#00d269',
    '#ff8103',
    '#00dfcf',
    '#f23ba9',
    '#0080ff',
    '#c13ce1',
    '#ffcd03',
    '#7c56ff',
    '#a7cf02',
    '#00d3ff',
    '#ff1414'
  ],
  [
    '#6e78fc',
    '#66e4a5',
    '#ffb36f',
    '#6df1e7',
    '#e576c2',
    '#66b3ff',
    '#dd83f2',
    '#ffea84',
    '#b692f6',
    '#e1f397',
    '#77e3ff',
    '#ff5a5a'
  ],
  [
    '#6e78fd',
    '#66e4a6',
    '#ffb370',
    '#6df1e8',
    '#e576c3',
    '#66b400',
    '#dd83f3',
    '#ffea85',
    '#b692f7',
    '#e1f398',
    '#77e400',
    '#ff5a5b'
  ]
]

export default function randomColor(count: number, gp = 1) {
  const one = (cursor: number) => {

    let c = 0;
    const colorGp = [];
    const bet = 70;
    for (let i = 0; i < gp; i++) {
      if (cursor >= 12) {
        let a, b;
        do {
          a = Math.round(Math.random() * 255);
        } while (Math.abs(a - 140) < 10);
        do {
          b = Math.round(Math.random() * 255);
        } while (Math.abs(b - 140) < 10);
        colorGp.push(`rgb(${a}, ${b}, ${c})`);
        c += bet;
        if (c > 255) break;
      } else {
        colorGp.push(defaultColor[i][cursor])
      }
    }
    return colorGp;
  };
  let colors = [];
  let i = 0
  while (count > 0) {
    const cp = one(i);
    colors.push(cp);
    count -= cp.length;
  }
  return colors;
}
