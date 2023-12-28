export default function modelExplain (
  model: any,
  role: string,
  partyId: string,
  component: string,
  comp_type: string,
  id: string
) {
  if (model && Object.keys(model).length > 0) {
    try {
      const explain = require(`./${comp_type}.ts`)
      return explain.default(model, role, partyId, component, comp_type, id)
    } catch(err) {
      if (process.env.NODE_ENV === 'development') {
        console.log(err)
      }
      return undefined
    }
  }
  return undefined
}