export const demoQrCodes = [
  { id: 1, label: 'Avis Google', url: 'https://g.page/r/crossfit-lab-toulouse/review', order_index: 0 },
  { id: 2, label: 'Instagram', url: 'https://instagram.com/crossfitlab.toulouse', order_index: 1 },
  { id: 3, label: 'Groupe WhatsApp', url: 'https://chat.whatsapp.com/crossfitlab-demo', order_index: 2 },
]

export const cloneDemoQrCodes = () => structuredClone(demoQrCodes)
