import { getToken } from '@/utils/auth'

const listeners = new Set()
const HEARTBEAT_INTERVAL = 30000
const RECONNECT_MIN_DELAY = 3000
const RECONNECT_MAX_DELAY = 30000

let socket = null
let socketToken = ''
let blockedToken = ''
let heartbeatTimer = null
let reconnectTimer = null
let reconnectDelay = RECONNECT_MIN_DELAY
let manuallyClosed = false

function buildSocketUrl() {
  const url = new URL('/api/ws/portal/tickets', window.location.origin)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  return url.toString()
}

function clearTimers() {
  if (heartbeatTimer) window.clearInterval(heartbeatTimer)
  if (reconnectTimer) window.clearTimeout(reconnectTimer)
  heartbeatTimer = null
  reconnectTimer = null
}

function startHeartbeat() {
  if (heartbeatTimer) window.clearInterval(heartbeatTimer)
  heartbeatTimer = window.setInterval(() => {
    const currentToken = getToken() || ''
    if (!currentToken || currentToken !== socketToken) {
      closeSocket(false)
      scheduleReconnect()
      return
    }
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'PING' }))
    }
  }, HEARTBEAT_INTERVAL)
}

function scheduleReconnect() {
  if (manuallyClosed || reconnectTimer || listeners.size === 0) return
  const token = getToken() || ''
  if (!token || token === blockedToken) return
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null
    connect()
  }, reconnectDelay)
  reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_MAX_DELAY)
}

function connect() {
  const token = getToken() || ''
  if (!token || token === blockedToken || listeners.size === 0) return
  if (socket && [WebSocket.CONNECTING, WebSocket.OPEN].includes(socket.readyState)) return

  manuallyClosed = false
  socketToken = token
  const currentSocket = new WebSocket(buildSocketUrl())
  socket = currentSocket
  currentSocket.onopen = () => {
    currentSocket.send(JSON.stringify({ type: 'AUTH', token: socketToken }))
  }
  currentSocket.onmessage = event => {
    let payload
    try {
      payload = JSON.parse(event.data)
    } catch {
      return
    }
    if (payload.type === 'AUTH_OK') {
      reconnectDelay = RECONNECT_MIN_DELAY
      blockedToken = ''
      startHeartbeat()
      return
    }
    if (payload.event === 'MESSAGE_CREATED') {
      listeners.forEach(listener => listener(payload))
    }
  }
  currentSocket.onerror = () => currentSocket.close()
  currentSocket.onclose = event => {
    if (socket !== currentSocket) return
    if (event.code === 1008) blockedToken = socketToken
    socket = null
    if (heartbeatTimer) window.clearInterval(heartbeatTimer)
    heartbeatTimer = null
    scheduleReconnect()
  }
}

function closeSocket(manual = true) {
  manuallyClosed = manual
  clearTimers()
  if (socket) {
    const current = socket
    socket = null
    current.onclose = null
    current.close()
  }
}

/**
 * 订阅门户工单实时消息，返回取消订阅函数。
 */
export function subscribeTicketRealtime(listener) {
  listeners.add(listener)
  const token = getToken() || ''
  if (blockedToken && blockedToken !== token) blockedToken = ''
  connect()
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) closeSocket(true)
  }
}
