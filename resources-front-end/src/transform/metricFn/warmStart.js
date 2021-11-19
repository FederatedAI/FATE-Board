function warmStartExchange(res, role) {
  let data = res.data.train
  const group = []
  if (data.init_iter) {
    data = data.init_iter
    if (data) {
      data = data.data[0]
      group.push({
        type: 'text',
        props: {
          content: `warm_start initial iteration: ${data[1]}`
        }})
    }
  }
  return group
  // return group
}

export default warmStartExchange
