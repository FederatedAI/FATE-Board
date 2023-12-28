const Measure_Canvas = document.createElement('canvas');
Measure_Canvas.setAttribute('width', '100');
Measure_Canvas.setAttribute('height', '100');
Measure_Canvas.setAttribute('style', 'width:100px;height:100px;');

type MeasureBox = {
  width?: number;
  x?: number;
  y?: number;
};

export default function measureText(
  text: string,
  fontSize: number = 16,
  fontFamily: string = 'arial'
): number {
  const ctx = Measure_Canvas.getContext('2d');
  if (ctx) {
    ctx.save();
    ctx.font = `${fontSize}px ${fontFamily}`;
    const stylus = ctx.measureText(text);
    ctx.restore();
    return (
      Math.abs(stylus.actualBoundingBoxLeft) +
      Math.abs(stylus.actualBoundingBoxRight)
    );
  }
  return 0;
}
