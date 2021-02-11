export function getAgentForRequest(agent: any) {
  return function (req: any) {
    return agent
  }
}
