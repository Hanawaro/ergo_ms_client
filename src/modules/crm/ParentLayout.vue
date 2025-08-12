<template>
  <router-view></router-view>

  <!-- Контейнер тостов в правом верхнем углу -->
  <div
    ref="toastContainer"
    class="toast-container position-fixed top-0 end-0 p-3"
    style="z-index: 1100;"
  ></div>
</template>

<script>
import Cookies from "js-cookie"
import { Toast } from "bootstrap" // Bootstrap 5 JS API

export default {
  name: 'CRMParentLayout',
  data() {
    return {
      notificationWs: null
    }
  },
  mounted() {
    // --- инициализация WS уведомлений ---
    const t = Cookies.get('token')
    if (!t) return null
    const parts = t.split('.')
    if (parts.length < 2) return null
    const pad = (s) => s + '='.repeat((4 - (s.length % 4)) % 4)
    const base64 = pad(parts[1]).replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    const payload = JSON.parse(json)
    const user_id = payload.user_id || payload.id || payload.sub || null
    if (!user_id) return

    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL ||
      `http://${import.meta.env.VITE_API_HOST || 'localhost'}:${import.meta.env.VITE_API_PORT || '8000'}/api`

    // ws://.../crm/ws/notifications/<user_id>
    this.notificationWs = new WebSocket(
      API_BASE_URL.replace(/^http/, 'ws') + `/crm/ws/notifications/${encodeURIComponent(user_id)}`
    )

    this.notificationWs.onmessage = async (e) => {
      try {
        const { event, payload } = JSON.parse(e.data)
        if (event === 'notification.created') {
          this.handleNotification(event, payload)
        }
      } catch (err) {
        // no-op
      }
    }
  },
  unmounted() {
    if (!this.notificationWs) return
    try {
      this.notificationWs.onopen = this.notificationWs.onmessage = this.notificationWs.onerror = this.notificationWs.onclose = null
      if (this.notificationWs.readyState === WebSocket.OPEN || this.notificationWs.readyState === WebSocket.CONNECTING) {
        this.notificationWs.close(1000, 'layout-unmounted')
      }
    } catch (e) {
      // ignore
    } finally {
      this.notificationWs = null
    }
  },
  methods: {
    // Маппинг уровня -> bootstrap-variant
    levelToVariant(level) {
      if (level === 'error') return 'danger'
      if (level === 'warn' || level === 'warning') return 'warning'
      return 'success'
    },

    // Безопасный вывод текста
    escapeHtml(s) {
      if (s == null) return ''
      return String(s).replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
      }[m]))
    },

    // Показать тост справа-сверху
    showToast({ title = 'Уведомление', text = '', variant = 'primary', delay = 5000 } = {}) {
      const container = this.$refs.toastContainer
      if (!container) return

      const el = document.createElement('div')
      // text-bg-* есть в Bootstrap 5.2+
      el.className = `toast text-bg-${variant} border-0 shadow`
      el.setAttribute('role', 'alert')
      el.setAttribute('aria-live', 'assertive')
      el.setAttribute('aria-atomic', 'true')

      el.innerHTML = `
        <div class="d-flex">
          <div class="toast-body">
            <div class="fw-semibold mb-1">${this.escapeHtml(title)}</div>
            <div>${this.escapeHtml(text)}</div>
          </div>
          <button
            type="button"
            class="btn-close btn-close-white me-2 m-auto"
            data-bs-dismiss="toast"
            aria-label="Close"
          ></button>
        </div>
      `

      container.appendChild(el)
      const toast = new Toast(el, { delay, autohide: true })
      el.addEventListener('hidden.bs.toast', () => {
        toast.dispose()
        el.remove()
      })
      toast.show()
    },

    // Ваш хендлер входящих ивентов
    handleNotification(event, payload) {
      const level = payload?.level || 'success'

      let title = payload?.title || 'Уведомление'
      let text = payload?.message || ''

      this.showToast({
        title,
        text,
        variant: this.levelToVariant(level),
        delay: 6000
      })
    }
  }
}
</script>
