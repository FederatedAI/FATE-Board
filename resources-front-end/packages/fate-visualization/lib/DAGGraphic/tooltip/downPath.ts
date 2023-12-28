import configuration from './configuration';

export default function downPath(prop: any) {
  let path = '';
  const p1 = [
    Number((configuration.margin + prop.width / 2).toFixed(0)),
    Number(configuration.margin.toFixed(0)),
  ];
  path += ` M ${p1.join(' ')}`;

  const p2 = [
    Number((p1[0] + configuration.trangleBottom / 2).toFixed(0)),
    Number((p1[1] + configuration.trangleHeight).toFixed(0)),
  ];

  path += ` L ${p2.join(' ')}`;

  const f1 = [
    Number(
      (
        p2[0] -
        configuration.trangleBottom / 2 +
        prop.width / 2 -
        configuration.rx
      ).toFixed(0)
    ),
    p2[1],
  ];
  const m1 = [
    Number(
      (p2[0] - configuration.trangleBottom / 2 + prop.width / 2).toFixed(0)
    ),
    p2[1],
  ];
  const t1 = [
    Number(
      (p2[0] - configuration.trangleBottom / 2 + prop.width / 2).toFixed(0)
    ),
    p2[1] + configuration.rx,
  ];

  path += ` L ${f1.join(' ')}`;
  path += ` Q ${m1.join(' ')}, ${t1.join(' ')}`;

  const f2 = [
    m1[0],
    Number((m1[1] + prop.height - configuration.rx).toFixed(0)),
  ];
  const m2 = [m1[0], Number((m1[1] + prop.height).toFixed(0))];
  const t2 = [f1[0], Number((f1[1] + prop.height).toFixed(0))];

  path += ` L ${f2.join(' ')}`;
  path += ` Q ${m2.join(' ')}, ${t2.join(' ')}`;

  const f3 = [
    Number((m2[0] - prop.width + configuration.rx).toFixed(0)),
    m2[1],
  ];
  const m3 = [Number((m2[0] - prop.width).toFixed(0)), m2[1]];
  const t3 = [
    Number((m2[0] - prop.width).toFixed(0)),
    Number((m2[1] - configuration.rx).toFixed(0)),
  ];

  path += ` L ${f3.join(' ')}`;
  path += ` Q ${m3.join(' ')}, ${t3.join(' ')}`;

  const f4 = [
    m3[0],
    Number((m3[1] - prop.height + configuration.rx).toFixed(0)),
  ];
  const m4 = [m3[0], Number((m3[1] - prop.height).toFixed(0))];
  const t4 = [
    Number((m3[0] + configuration.rx).toFixed(0)),
    Number((m3[1] - prop.height).toFixed(0)),
  ];

  path += ` L ${f4.join(' ')}`;
  path += ` Q ${m4.join(' ')}, ${t4.join(' ')}`;

  const p3 = [
    Number((p1[0] - configuration.trangleBottom / 2).toFixed(0)),
    Number((p1[1] + configuration.trangleHeight).toFixed(0)),
  ];

  path += ` L ${p3.join(' ')}`;
  path += ` Z`;

  return path;
}
