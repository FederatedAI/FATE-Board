export default function portConfigurationExplain ({ component, schema_version }: any) {
  const { input_artifacts, output_artifacts } = component
  const result: any = { version: schema_version }
  result['input'] = PORTExplain(input_artifacts, 'input')
  result['output'] = PORTExplain(output_artifacts, 'output')
  return result
}

function PORTExplain (PORTS: any, direction: string) {
  const inputPorts: any = []
  for (const key in PORTS) {
    const input = PORTS[key]
    if (key.match(/(data|model)/i)) {
      for (const portKey in input) {
        const port = input[portKey]
        inputPorts.push({
          name: portKey,
          tooltip: port.description || portKey,
          type: portKey,
          direction,
          mult: port.is_multi,
          roles: port.roles,
          stages: port.stages
        })
      }
    }
  }
  return inputPorts
}