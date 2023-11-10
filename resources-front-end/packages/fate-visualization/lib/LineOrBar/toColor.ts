export default function randomColor(count: number, gp = 1) {
  const one = () => {
    let a, b;
    do {
      a = Math.round(Math.random() * 255);
    } while (Math.abs(a - 140) < 10);
    do {
      b = Math.round(Math.random() * 255);
    } while (Math.abs(b - 140) < 10);

    let c = 0;
    const colorGp = [];
    const bet = 70;
    for (let i = 0; i < gp; i++) {
      colorGp.push(`rgb(${a}, ${b}, ${c})`);
      c += bet;
      if (c > 255) break;
    }
    return colorGp;
  };
  let colors = [];
  while (count > 0) {
    const cp = one();
    colors.push(cp);
    count -= cp.length;
  }
  if (gp === 1) {
    colors = colors.flat(Infinity);
  }
  return colors;
}
