const paths = {
  calendar:
    'M7 3v4m10-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Zm3 9h2m4 0h2m-8 3h2',
  plus: 'M12 5v14M5 12h14',
  history: 'M3 11a9 9 0 1 1 2.6 7.4M3 4v7h7m2-4v6l4 2',
  screen: 'M3 4h18v13H3Zm5 17h8m-4-4v4',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  logout: 'M9 4H4v16h5m5-13 5 5-5 5m-5-5h10',
  check: 'm5 12 4 4L19 6',
  close: 'm6 6 12 12M6 18 18 6',
  clock: 'M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  copy: 'M8 8h12v12H8ZM16 8V4H4v12h4',
  edit: 'm15 5 4 4M4 20l5-1L21 7l-4-4L5 15Z',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13m-8 4v5m4-5v5',
  search: 'm16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  bolt: 'M13 2 4 14h7l-1 8 10-13h-8Z',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5Zm7 4v3',
  barbell: 'M3 7v10m4-13v16m10-16v16m4-13v10M7 12h10M1 12h2m18 0h2',
}
export default function Icon({ name, className = '' }) {
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.bolt} />
    </svg>
  )
}
