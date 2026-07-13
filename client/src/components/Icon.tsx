type IconName =
  | 'arrow' | 'back' | 'camera' | 'upload' | 'shield' | 'check' | 'refresh'
  | 'close' | 'lock' | 'edit' | 'id' | 'user' | 'mail' | 'eye' | 'eyeOff'
  | 'clipboard' | 'users' | 'chart' | 'settings' | 'plus' | 'search' | 'file'
  | 'send' | 'sparkles' | 'logout'

const paths: Record<IconName, string> = {
  arrow: 'm14 5 7 7-7 7M21 12H3', back: 'm15 18-6-6 6-6', camera: 'M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 0 2-2V9a2 2 0 0 1 2-2Zm8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', upload: 'M12 16V3m0 0L7 8m5-5 5 5M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-4', check: 'm5 12 4 4L19 6', refresh: 'M21 12a9 9 0 0 1-15.5 6.2M3 12a9 9 0 0 1 15.5-6.2M3 18v-5h5m10-7v5h-5', close: 'M6 6l12 12M18 6 6 18', lock: 'M6 10V8a6 6 0 0 1 12 0v2m-13 0h14v10H5V10Z', edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z', id: 'M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Zm4 4h5m-5 4h8m2-4h.01M16 16a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  user: 'M20 21a8 8 0 0 0-16 0m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z', mail: 'M4 5h16v14H4V5Zm0 1 8 6 8-6', eye: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', eyeOff: 'm3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a18.5 18.5 0 0 1-3 3.8M6.6 6.6C3.7 8.5 2 12 2 12s3.5 7 10 7c1 0 1.9-.2 2.8-.5',
  clipboard: 'M9 5h6m-5-2h4a2 2 0 0 1 2 2v1H8V5a2 2 0 0 1 2-2Zm-4 3h14v15H5V6Zm4 5h6m-6 4h6', users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m14-6a4 4 0 1 0 0-8m-4 5a4 4 0 1 0-8 0', chart: 'M4 20V10m6 10V4m6 16v-7m4 7H2', settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2 2-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V20h-2.82v-.1a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2-2 .06-.06A1.7 1.7 0 0 0 7.42 15a1.7 1.7 0 0 0-1.56-1.04H5.8v-2.82h.1a1.7 1.7 0 0 0 1.56-1.04A1.7 1.7 0 0 0 7.12 8.2l-.06-.06 2-2 .06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 12.04 5V4.9h2.82V5a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2 2-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 21 11.14h.1v2.82H21A1.7 1.7 0 0 0 19.4 15Z',
  plus: 'M12 5v14m-7-7h14', search: 'm21 21-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z', file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8M8 17h5', send: 'm22 2-7 20-4-9-9-4 20-7ZM11 13 15 9', sparkles: 'm12 3-1.4 5.6L5 10l5.6 1.4L12 17l1.4-5.6L19 10l-5.6-1.4L12 3ZM5 17l-.7 2.3L2 20l2.3.7L5 23l.7-2.3L8 20l-2.3-.7L5 17Zm14-2-.8 3.2L15 19l3.2.8L19 23l.8-3.2L23 19l-3.2-.8L19 15Z', logout: 'M10 17l5-5-5-5m5 5H3m10-7V3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7v-2',
}

export function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}><path d={paths[name]} /></svg>
}
