// Today's session in the members' space, as phones open it from the TV's QR code.
// VITE_PUBLIC_URL lets a local TV point phones to the deployed site (phones
// can't reach "localhost"); otherwise the address the TV itself is using.
export function memberUrl() {
  const base = import.meta.env?.VITE_PUBLIC_URL || window.location.origin
  return `${base.replace(/\/$/, '')}/seance`
}
