/** 是否控制台壳层路由 */
export function isConsolePath(path = '') {
  return path === '/console' || path.startsWith('/console/')
}

/**
 * 官网壳 ↔ 控制台壳 过渡名
 * - 官网 → 控制台：fade-up
 * - 控制台 → 官网：fade-quick
 * - 同壳内切换：空字符串（组件 key 不变，不触发过渡）
 */
export function getShellTransition(fromPath = '', toPath = '') {
  const fromConsole = isConsolePath(fromPath)
  const toConsole = isConsolePath(toPath)
  if (!fromConsole && toConsole) return 'fade-up'
  if (fromConsole && !toConsole) return 'fade-quick'
  return ''
}
