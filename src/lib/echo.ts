import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import type { ChannelAuthorizationData } from 'pusher-js/types/src/core/auth/options'
import { api } from '@/services/api'

// Laravel Echo's Pusher connector reads the client off `window.Pusher`.
;(window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher

let echo: Echo<'reverb'> | null = null

/**
 * Lazily creates (and reuses) the Reverb connection. Channel auth is routed
 * through the app's own `api` axios instance instead of Echo's default
 * fetch-based authorizer, since this backend authenticates every request via
 * a Bearer token (VerifyFirebaseToken), not a Sanctum session cookie — same
 * approach as laundryApp's hand-rolled realtime_service.dart.
 */
export function getEcho(): Echo<'reverb'> {
  if (echo) return echo

  echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 80,
    wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel: { name: string }) => ({
      authorize: (socketId: string, callback: (error: Error | null, data: ChannelAuthorizationData | null) => void) => {
        api
          .post('/broadcasting/auth', {
            socket_id: socketId,
            channel_name: channel.name,
          })
          .then((response) => callback(null, response.data))
          .catch((error) => callback(error, null))
      },
    }),
  })

  return echo
}

export function disconnectEcho() {
  echo?.disconnect()
  echo = null
}
