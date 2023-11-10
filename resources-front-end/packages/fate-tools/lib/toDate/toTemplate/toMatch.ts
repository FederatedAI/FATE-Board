export default function toMatch(
  date: Date | number | string,
  explain: (date: Date | number | string) => string | number,
  leng: number = 2,
  pad: string = '0'
) {
  // let str;

  const padStart = (origin: number | string) =>
    origin.toString().padStart(leng, pad);

  // if (date instanceof Date) {
  return padStart(explain(<Date>date));
  // } else {
  //   str = padStart(date);
  // }

  // return str;
}
