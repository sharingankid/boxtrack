import { test, expect } from '@playwright/test'
import { parisNow, addDays } from '../src/lib/schedule.js'
const today = parisNow().date
const session = (id, start_time, title) => ({
  id,
  session_date: today,
  start_time,
  end_time: `${String(Number(start_time.slice(0, 2)) + 1).padStart(2, '0')}:00`,
  title,
  warmup: {
    general: '3 tours\n250 m rameur\n10 air squats\n8 scap pull-ups',
    specific:
      '2 tours progressifs\n8 front squats barre à vide\n6 burpees over bar',
  },
  skill_strength: {
    kind: 'strength',
    instructions:
      'Monter en charge avec une exécution propre. Repos 2 min entre les séries.',
    movements: [{ movement_name: 'Front Squat', detail: '5 × 3 @ 80 %' }],
  },
  wod: {
    format: 'AMRAP',
    duration_or_target: '16 minutes',
    movements: [
      { movement_name: 'Wall Ball', detail: '12 reps · 9 / 6 kg' },
      { movement_name: 'Toes-to-Bar', detail: '9 reps' },
      { movement_name: 'Burpee Box Jump', detail: '6 reps · 60 / 50 cm' },
    ],
    notes:
      'Rester régulier dès le premier tour. Adapter la charge pour des séries non cassées.',
  },
})
async function mock(page) {
  const state = {
    items: [
      session(1, '06:00', 'Force & conditionnement'),
      session(2, '18:00', 'WOD du soir'),
      {
        ...session(3, '18:00', 'Prochaine programmation'),
        session_date: addDays(today, 1),
      },
    ],
    error: 0,
    network: false,
    tv: null,
  }
  await page.route('**/api/**', async (route) => {
    const request = route.request(),
      url = new URL(request.url()),
      path = url.pathname.replace('/api', ''),
      method = request.method()
    if (state.network) return route.abort('failed')
    const send = (body, status = 200) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      })
    if (path === '/auth/login')
      return send({
        token: 'test-token',
        user: { id: 1, email: request.postDataJSON().email, role: 'staff' },
      })
    if (path === '/auth/logout') return route.fulfill({ status: 204 })
    if (method !== 'GET' && state.error)
      return send(
        { error: { code: 'TEST_ERROR', message: 'Erreur de test' } },
        state.error,
      )
    if (path === '/wods/tv-now')
      return send(
        state.tv || {
          current: state.items[0],
          next: state.items[1],
          remaining: state.items,
          reference_date: today,
          reference_time: '06:30',
          timezone: 'Europe/Paris',
        },
      )
    if (path === '/wods') return send({ wods: state.items })
    if (path.startsWith('/wods/'))
      return send({
        wod: state.items.find((x) => x.id === Number(path.split('/').at(-1))),
      })
    if (path.startsWith('/admin/wods')) {
      expect(request.headers().authorization).toBe('Bearer test-token')
      const id = Number(path.split('/').at(-1))
      if (method === 'DELETE') {
        state.items = state.items.filter((x) => x.id !== id)
        return route.fulfill({ status: 204 })
      }
      const payload = request.postDataJSON()
      expect(payload.time_slot).toBeUndefined()
      if (
        state.items.some(
          (x) =>
            x.id !== id &&
            x.session_date === payload.session_date &&
            x.start_time === payload.start_time,
        )
      )
        return send({ error: { code: 'DUPLICATE_SESSION' } }, 409)
      const saved = {
        ...payload,
        id:
          method === 'POST'
            ? Math.max(...state.items.map((x) => x.id), 0) + 1
            : id,
      }
      state.items =
        method === 'POST'
          ? [...state.items, saved]
          : state.items.map((x) => (x.id === id ? saved : x))
      return send({ wod: saved }, method === 'POST' ? 201 : 200)
    }
    throw new Error(`Unexpected API ${method} ${path}`)
  })
  return state
}
async function login(page) {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login$/)
  await page.getByLabel('Email', { exact: true }).fill('staff@crossfitlab.fr')
  await page.getByLabel('Mot de passe', { exact: true }).fill('test-password')
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click()
  await expect(page).toHaveURL(/\/coach$/)
  await expect(
    page.getByRole('heading', { name: 'Le planning', exact: true }),
  ).toBeVisible()
}
async function section(page, index) {
  await page
    .getByRole('navigation', { name: 'Sections de la séance' })
    .getByRole('button')
    .nth(index)
    .click()
}
async function noOverflow(page, tv = false) {
  const dimensions = await page.evaluate(() => ({
    width: innerWidth,
    height: innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width)
  if (tv) expect(dimensions.scrollHeight).toBeLessThanOrEqual(dimensions.height)
}
test('routes, persistent staff session, logout and local expiry', async ({
  page,
}) => {
  await mock(page)
  for (const path of [
    '/coach',
    '/coach/sessions',
    '/coach/sessions/new',
    '/coach/sessions/1/edit',
    '/history',
    '/sessions/1',
  ]) {
    await page.goto(path)
    await expect(page).toHaveURL(/\/login$/)
  }
  await login(page)
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Le planning', exact: true }),
  ).toBeVisible()
  await page.goto('/')
  await expect(page).toHaveURL(/\/coach$/)
  await page.getByRole('button', { name: 'Déconnexion' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await login(page)
  await page.evaluate(() => {
    const key = 'boxtrack.auth.api.v3'
    const s = JSON.parse(localStorage.getItem(key))
    s.expiresAt = Date.now() - 1
    localStorage.setItem(key, JSON.stringify(s))
  })
  await page.reload()
  await expect(page).toHaveURL(/\/login$/)
})
test('complete creation, validation, warmups, review, edit, duplication, deletion', async ({
  page,
}) => {
  const state = await mock(page)
  await login(page)
  await page
    .getByRole('link', { name: 'Créer une séance', exact: true })
    .first()
    .click()
  await page.getByLabel('Heure de début', { exact: true }).fill('10:00')
  await page.getByLabel('Heure de fin', { exact: true }).fill('09:00')
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(
    page.getByText('L’heure de fin doit être après le début, le même jour.'),
  ).toBeVisible()
  await page.getByLabel('Heure de fin', { exact: true }).fill('11:00')
  await page
    .getByLabel('Titre (facultatif)', { exact: true })
    .fill('Séance complète')
  await section(page, 1)
  await page
    .getByLabel('Warm-Up général', { exact: true })
    .fill('Row 3 min\nMobility')
  await page
    .getByLabel('Warm-Up spécifique', { exact: true })
    .fill('Empty bar squats')
  await section(page, 2)
  await page.getByRole('button', { name: 'Strength Travail de force', exact: true }).click()
  await page.getByLabel('Nom · Skill 1', { exact: true }).fill('Back squat')
  await page.getByLabel('Séries · Skill 1', { exact: true }).fill('5')
  await page.getByLabel('Répétitions · Skill 1', { exact: true }).fill('3')
  await page.getByLabel('Charge · Skill 1', { exact: true }).fill('80 kg')
  await page
    .getByRole('button', { name: 'Dupliquer Skill mouvement 1', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Supprimer Skill mouvement 2', exact: true })
    .click()
  await section(page, 3)
  await page.getByLabel('Durée ou objectif', { exact: true }).fill('20 min')
  await page.getByLabel('Nom · WOD 1', { exact: true }).fill('Wall Ball')
  await page.getByLabel('Répétitions · WOD 1', { exact: true }).fill('12')
  await page
    .getByRole('button', { name: 'Ajouter un mouvement WOD', exact: true })
    .click()
  await page.getByLabel('Nom · WOD 2', { exact: true }).fill('Row')
  await page.getByLabel('Instructions · WOD 2', { exact: true }).fill('250 m')
  await page
    .getByLabel('Remarques du coach', { exact: true })
    .fill('Keep a steady pace')
  await section(page, 4)
  await expect(
    page.getByRole('button', { name: /Warm-Up Modifier/ }),
  ).toContainText('Empty bar squats')
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page.getByText('Séance créée.', { exact: true })).toBeVisible()
  const saved = state.items.find((x) => x.title === 'Séance complète')
  expect(saved.skill_strength.movements[0].detail).toBe(
    '5 séries · 3 reps · 80 kg',
  )
  await page.goto(`/coach/sessions/${saved.id}/edit`)
  await section(page, 1)
  await page.getByLabel('Warm-Up général', { exact: true }).fill('')
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(
    page.getByText('Séance modifiée.', { exact: true }),
  ).toBeVisible()
  expect(state.items.find((x) => x.id === saved.id).warmup).toEqual({
    general: null,
    specific: 'Empty bar squats',
  })
  const row = page
    .locator('.planning-row')
    .filter({ hasText: 'Séance complète' })
  await row.getByRole('link', { name: 'Dupliquer', exact: true }).click()
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(
    page.getByText('Séance dupliquée.', { exact: true }),
  ).toBeVisible()
  expect(state.items.filter((x) => x.title === 'Séance complète')).toHaveLength(
    2,
  )
  await page
    .locator('.planning-row')
    .filter({ hasText: 'Séance complète' })
    .first()
    .getByRole('button', { name: 'Supprimer' })
    .click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Annuler' })
    .click()
  expect(state.items.filter((x) => x.title === 'Séance complète')).toHaveLength(
    2,
  )
  await page
    .locator('.planning-row')
    .filter({ hasText: 'Séance complète' })
    .first()
    .getByRole('button', { name: 'Supprimer' })
    .click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Supprimer la séance', exact: true })
    .click()
  await expect(
    page.getByText('Séance supprimée.', { exact: true }),
  ).toBeVisible()
  expect(state.items.filter((x) => x.title === 'Séance complète')).toHaveLength(
    1,
  )
})
test('API failures preserve draft; 403 remains signed in, 401 redirects; unsaved exit', async ({
  page,
}) => {
  const state = await mock(page)
  await login(page)
  await page.goto('/coach/sessions/new')
  await page.getByLabel('Heure de début', { exact: true }).fill('10:00')
  await page.getByLabel('Heure de fin', { exact: true }).fill('11:00')
  await page
    .getByLabel('Titre (facultatif)', { exact: true })
    .fill('Brouillon réseau')
  state.network = true
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('saisie est conservée')
  await expect(
    page.getByLabel('Titre (facultatif)', { exact: true }),
  ).toHaveValue('Brouillon réseau')
  state.network = false
  state.error = 403
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('pas autorisé')
  await expect(page).toHaveURL(/\/coach\/sessions\/new$/)
  await page.getByRole('link', { name: 'Annuler', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Annuler', exact: true })
    .click()
  state.error = 401
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByText(/Votre session a expiré/)).toBeVisible()
  state.error = 0
  await page.getByLabel('Email', { exact: true }).fill('staff@crossfitlab.fr')
  await page.getByLabel('Mot de passe', { exact: true }).fill('test-password')
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click()
  await page.goto('/coach/sessions/new')
  await expect(
    page.getByLabel('Titre (facultatif)', { exact: true }),
  ).toHaveValue('Brouillon réseau')
})
test('responsive coach and editor captures at every requested size', async ({
  page,
}) => {
  test.setTimeout(90000)
  await page.clock.setFixedTime(new Date(`${today}T18:30:00+02:00`))
  await mock(page)
  await login(page)
  for (const [width, height] of [
    [360, 800],
    [390, 844],
    [430, 932],
    [768, 1024],
    [1440, 900],
  ]) {
    await page.setViewportSize({ width, height })
    await page.goto('/coach')
    await expect(page.locator('.planning-row').first()).toBeVisible()
    await noOverflow(page)
    await page.screenshot({
      path: `verification/coach-${width}x${height}.png`,
      fullPage: false,
      animations: 'disabled',
    })
    await page.goto('/coach/sessions/1/edit')
    await expect(page.getByLabel('Date', { exact: true })).toBeVisible()
    await noOverflow(page)
    for (const index of [0, 1, 2, 3, 4]) {
      await section(page, index)
      await noOverflow(page)
    }
    await page.screenshot({
      path: `verification/editor-${width}x${height}.png`,
      fullPage: false,
      animations: 'disabled',
    })
  }
})
test('TV current, next, empty, automatic changes, network failure and no scroll', async ({
  page,
}) => {
  test.setTimeout(90000)
  await page.clock.install({ time: new Date(`${today}T06:30:00+02:00`) })
  const state = await mock(page)
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto('/screen')
  await expect(page.locator('.tv-wod h2')).toHaveText('WOD du jour')
  await expect(page.locator('.tv-wod-format')).toHaveText('AMRAP')
  await expect(page.locator('.tv-phase-heading')).toHaveText([
    'Échauffement',
    'Force',
  ])
  await expect(page.locator('.tv-movement-index')).toHaveCount(0)
  await expect(page.locator('.tv-wod-bottom')).toContainText(
    'Un maximum de tours dans le temps imparti',
  )
  await expect(page.locator('.tv-session-meta')).toContainText('En cours')
  await expect(
    page.getByRole('progressbar', { name: 'Progression du créneau' }),
  ).toHaveAttribute('aria-valuenow', '50')
  await expect(page.locator('.tv-warmup')).toContainText('Échauffement')
  await expect(page.locator('.tv-strength')).toContainText('Force')
  await noOverflow(page, true)
  await page.screenshot({
    path: 'verification/tv-1920x1080.png',
    animations: 'disabled',
  })
  const fit = await page.locator('.tv-fit-area').evaluateAll((areas) =>
    areas.map((area) => ({
      h: area.clientHeight,
      ch: area.firstChild.scrollHeight,
      w: area.clientWidth,
      cw: area.firstChild.scrollWidth,
      font: parseFloat(getComputedStyle(area.firstChild).fontSize),
    })),
  )
  for (const box of fit) {
    expect(box.ch).toBeLessThanOrEqual(box.h)
    expect(box.cw).toBeLessThanOrEqual(box.w)
    expect(box.font).toBeGreaterThanOrEqual(24)
  }
  state.tv = {
    current: null,
    next: state.items[1],
    remaining: [state.items[1]],
  }
  await page.clock.fastForward(31000)
  await expect(page.locator('.tv-session-meta')).toContainText(
    'Prochaine séance',
  )
  await expect(page.locator('.tv-session-title')).toHaveText('WOD du soir')
  await expect(
    page.getByRole('progressbar', { name: 'Progression du créneau' }),
  ).toHaveAttribute('aria-valuenow', '0')
  state.network = true
  await page.clock.fastForward(31000)
  await expect(page.locator('.tv-screen footer')).toContainText(
    'Hors connexion',
  )
  await noOverflow(page, true)
  state.network = false
  state.tv = { current: null, next: null, remaining: [] }
  await page.clock.fastForward(31000)
  await expect(
    page.getByRole('heading', { name: 'Aucune séance à venir' }),
  ).toBeVisible()
  await noOverflow(page, true)
  await page.screenshot({ path: 'verification/tv-empty-1920x1080.png' })
  state.network = true
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Programme indisponible' }),
  ).toBeVisible()
  await noOverflow(page, true)
  await page.screenshot({ path: 'verification/tv-network-1920x1080.png' })
})

test('empty coach day and network error can recover', async ({ page }) => {
  const state = await mock(page)
  state.items = []
  await login(page)
  await expect(
    page.getByText('Aucune séance prévue aujourd’hui.', { exact: true }),
  ).toBeVisible()
  state.network = true
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Planning indisponible' }),
  ).toBeVisible()
  state.network = false
  state.items = [session(1, '18:00', 'Programme rétabli')]
  await page.getByRole('button', { name: 'Réessayer', exact: true }).click()
  await expect(page.locator('.planning-row')).toContainText('Programme rétabli')
})

test('logout warns about unpublished changes and keeps the draft', async ({
  page,
}) => {
  await mock(page)
  await login(page)
  await page.goto('/coach/sessions/new')
  await page
    .getByLabel('Titre (facultatif)', { exact: true })
    .fill('Brouillon avant déconnexion')
  await page.getByRole('button', { name: 'Déconnexion', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText(
    'Se déconnecter sans enregistrer ?',
  )
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Annuler', exact: true })
    .click()
  await expect(
    page.getByLabel('Titre (facultatif)', { exact: true }),
  ).toHaveValue('Brouillon avant déconnexion')
  await page.getByRole('button', { name: 'Déconnexion', exact: true }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Se déconnecter', exact: true })
    .click()
  await expect(page).toHaveURL(/\/login$/)
  await login(page)
  await page.goto('/coach/sessions/new')
  await expect(
    page.getByLabel('Titre (facultatif)', { exact: true }),
  ).toHaveValue('Brouillon avant déconnexion')
})

test('TV formats and longer programs fit the broadcast canvas', async ({
  page,
}) => {
  await page.clock.install({ time: new Date(`${today}T18:30:00+02:00`) })
  const state = await mock(page)
  await page.setViewportSize({ width: 1920, height: 1080 })
  for (const format of [
    'AMRAP',
    'FOR_TIME',
    'EMOM',
    'TABATA',
    'CHIPPER',
    'STRENGTH',
  ]) {
    const item = session(7, '18:00', 'Technique, force et conditionnement')
    item.wod.format = format
    item.wod.duration_or_target =
      format === 'FOR_TIME' ? '21–15–9 / cap 18 min' : '20 minutes'
    item.wod.movements.push({
      movement_name: 'Alternating Dumbbell Snatch',
      detail: '20 reps · 22,5 / 15 kg',
    })
    state.tv = { current: item, next: null, remaining: [item] }
    await page.goto('/screen')
    await expect(page.locator('.tv-wod h2')).toHaveText('WOD du jour')
    await expect(page.locator('.tv-wod-format')).toHaveText(
      format === 'FOR_TIME'
        ? 'For Time'
        : format === 'STRENGTH'
          ? 'Strength'
          : format === 'TABATA'
            ? 'Tabata'
            : format === 'CHIPPER'
              ? 'Chipper'
              : format,
    )
    await expect(page.locator('.tv-objective')).toContainText(
      item.wod.duration_or_target,
    )
    await page.evaluate(() => document.fonts.ready)
    await noOverflow(page, true)
    const boxes = await page.locator('.tv-fit-area').evaluateAll((areas) =>
      areas.map((area) => ({
        height: area.clientHeight,
        content: area.firstChild.scrollHeight,
        width: area.clientWidth,
        contentWidth: area.firstChild.scrollWidth,
      })),
    )
    for (const box of boxes) {
      expect(box.content).toBeLessThanOrEqual(box.height)
      expect(box.contentWidth).toBeLessThanOrEqual(box.width)
    }
    const heading = await page.locator('.tv-wod-heading').evaluate((area) => ({
      width: area.clientWidth,
      content: area.scrollWidth,
    }))
    expect(heading.content).toBeLessThanOrEqual(heading.width)
    if (format === 'FOR_TIME')
      await page.screenshot({
        path: 'verification/tv-for-time-1920x1080.png',
        animations: 'disabled',
      })
  }
})

test('week navigation, selected-day creation and history search', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date(`${today}T18:30:00+02:00`))
  await mock(page)
  await login(page)
  await expect(page.locator('.programme-brief')).toContainText('Échauffement')
  await expect(page.locator('.programme-brief')).toContainText('Wall Ball')
  const days = page
    .getByRole('group', { name: 'Choisir un jour' })
    .getByRole('button')
  await expect(days).toHaveCount(7)
  await days.nth(1).click()
  await expect(page.locator('.day-sessions')).toContainText(
    'Prochaine programmation',
  )
  await days.nth(2).click()
  await expect(page.locator('.day-sessions')).toContainText(
    'Aucune séance prévue ce jour.',
  )
  await page.getByRole('link', { name: 'Programmer ce jour' }).click()
  await expect(page.getByLabel('Date', { exact: true })).toHaveValue(
    addDays(today, 2),
  )
  await page.getByRole('link', { name: 'Historique', exact: true }).click()
  const search = page.getByRole('searchbox', {
    name: 'Rechercher une séance passée',
  })
  await search.fill('Force')
  await expect(page.locator('.planning-row')).toHaveCount(1)
  await expect(page.locator('.planning-row')).toContainText(
    'Force & conditionnement',
  )
  await search.fill('Aucun résultat possible')
  await expect(
    page.getByRole('heading', { name: 'Aucune séance correspondante' }),
  ).toBeVisible()
  await search.fill('')
  await expect(page.locator('.planning-row')).toHaveCount(1)
})

test('editor TV preview follows the programme on desktop and mobile', async ({
  page,
}) => {
  await mock(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await login(page)
  await page.goto('/coach/sessions/new')
  const desktopPreview = page.locator('.preview-sidebar')
  await expect(desktopPreview).toBeVisible()
  await page.getByLabel('Titre (facultatif)', { exact: true }).fill('Séance test TV')
  await section(page, 1)
  await page.getByLabel('Warm-Up général', { exact: true }).fill('5 min rameur')
  await section(page, 3)
  await page.getByLabel('Durée ou objectif', { exact: true }).fill('12 min')
  await page.getByLabel('Nom · WOD 1', { exact: true }).fill('Thruster')
  await expect(desktopPreview).toContainText('Séance test TV')
  await expect(desktopPreview).toContainText('5 min rameur')
  await expect(desktopPreview).toContainText('Thruster')
  await expect(desktopPreview).toContainText('12 min')
  await noOverflow(page)
  await desktopPreview.getByRole('button', { name: 'Vérifier en plein écran' }).click()
  const fullPreview = page.getByRole('dialog', {
    name: 'Aperçu plein écran de la vue TV',
  })
  await expect(fullPreview.locator('.tv-wod h2')).toHaveText('WOD du jour')
  await expect(fullPreview.locator('.tv-wod-format')).toHaveText('AMRAP')
  await expect(fullPreview.locator('.tv-wod')).toContainText('Thruster')
  await expect(fullPreview.locator('.tv-warmup')).toContainText('5 min rameur')
  await page.screenshot({
    path: 'verification/editor-tv-full-preview-1440x900.png',
    animations: 'disabled',
  })
  await page.keyboard.press('Escape')
  await expect(fullPreview).not.toBeVisible()
  await page.screenshot({
    path: 'verification/editor-preview-1440x900.png',
    animations: 'disabled',
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await section(page, 4)
  const mobilePreview = page.locator('.preview-inline')
  await expect(mobilePreview).toBeVisible()
  await expect(mobilePreview).toContainText('Thruster')
  await mobilePreview.getByRole('button', { name: 'Vérifier en plein écran' }).click()
  await expect(fullPreview.locator('.tv-wod')).toContainText('Thruster')
  await page.screenshot({
    path: 'verification/editor-tv-full-preview-390x844.png',
    animations: 'disabled',
  })
  await fullPreview.getByRole('button', { name: 'Agrandir pour lire' }).click()
  const zoomedStage = fullPreview.locator('.tv-preview-stage')
  await expect(zoomedStage).toHaveClass(/is-zoomed/)
  expect(
    await zoomedStage.evaluate((element) => element.scrollWidth > element.clientWidth),
  ).toBe(true)
  await page.screenshot({
    path: 'verification/editor-tv-zoom-390x844.png',
    animations: 'disabled',
  })
  await fullPreview.getByRole('button', { name: 'Vue entière' }).click()
  await expect(zoomedStage).not.toHaveClass(/is-zoomed/)
  await fullPreview.getByRole('button', { name: 'Revenir à l’édition' }).click()
  await expect(fullPreview).not.toBeVisible()
  await noOverflow(page)
})

test('login controls, responsive captures and reduced motion', async ({
  page,
}) => {
  test.setTimeout(90000)
  await mock(page)
  await page.goto('/login')
  await page.getByLabel('Mot de passe', { exact: true }).fill('secret-preview')
  await page
    .getByRole('button', { name: 'Afficher le mot de passe', exact: true })
    .click()
  await expect(
    page.getByLabel('Mot de passe', { exact: true }),
  ).toHaveAttribute('type', 'text')
  await page
    .getByRole('button', { name: 'Masquer le mot de passe', exact: true })
    .click()
  await expect(
    page.getByLabel('Mot de passe', { exact: true }),
  ).toHaveAttribute('type', 'password')
  await page.getByLabel('Mot de passe', { exact: true }).fill('')
  for (const [width, height] of [
    [360, 800],
    [390, 844],
    [430, 932],
    [768, 1024],
    [1440, 900],
  ]) {
    await page.setViewportSize({ width, height })
    await noOverflow(page)
    await page.screenshot({
      path: `verification/login-${width}x${height}.png`,
      animations: 'disabled',
      fullPage: true,
    })
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await login(page)
  expect(
    await page
      .locator('.route-content')
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none')
  await page
    .getByRole('link', { name: 'Créer une séance', exact: true })
    .first()
    .click()
  await section(page, 3)
  await expect(page.locator('.format-explanation')).toContainText(
    'Un maximum de tours',
  )
  await page.getByRole('button', { name: 'EMOM', exact: true }).click()
  await expect(page.locator('.format-explanation')).toContainText(
    'chaque minute',
  )
  await expect(page.getByLabel('Nom · WOD 1', { exact: true })).toHaveAttribute(
    'list',
    'movement-suggestions',
  )
  expect(
    await page
      .locator('.section-content:visible')
      .evaluate((el) => getComputedStyle(el).animationName),
  ).toBe('none')
})

test('local generator fills a draft, respects exclusions and saves through the existing API', async ({ page }) => {
  const state = await mock(page)
  await login(page)
  await page.goto('/coach/sessions/new')
  await page.getByLabel('Date', { exact: true }).fill(addDays(today, 5))
  await page.locator('.session-generator > summary').click()
  await page.getByLabel('Durée totale', { exact: true }).selectOption('45')
  await page.getByLabel('Format du WOD', { exact: true }).selectOption('EMOM')
  await page.getByLabel('Mouvements à exclure', { exact: true }).fill('squat, burpee')
  await page.getByRole('button', { name: 'Préparer une proposition' }).click()
  await expect(page.locator('.generator-proposal')).toBeVisible()
  await expect(page.locator('.generator-proposal')).not.toContainText(/squat|burpee/i)
  await page.getByRole('button', { name: 'Utiliser cette proposition' }).click()
  await expect(page.getByText('Proposition appliquée au brouillon.', { exact: false })).toBeVisible()
  await expect(page.getByLabel('Heure de fin', { exact: true })).toHaveValue('18:45')
  await page.getByRole('button', { name: 'Préparer une proposition' }).click()
  await page.getByRole('button', { name: 'Utiliser cette proposition' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('dialog').getByRole('button', { name: 'Annuler', exact: true }).click()
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page).toHaveURL(/\/coach$/)
  const saved = state.items.find(item => item.session_date === addDays(today, 5))
  expect(saved.start_time).toBe('18:00')
  expect(saved.end_time).toBe('18:45')
  expect(saved.wod.format).toBe('EMOM')
  expect(saved.wod.movements).toHaveLength(3)
})

test('saving a generated session on an occupied slot shows feedback and preserves the draft', async ({ page }) => {
  await mock(page)
  await login(page)
  await page.goto('/coach/sessions/new')
  await page.locator('.session-generator > summary').click()
  await page.getByRole('button', { name: 'Préparer une proposition' }).click()
  await page.getByRole('button', { name: 'Utiliser cette proposition' }).click()
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page.locator('.save-bar-feedback')).toContainText('Ce créneau est déjà occupé')
  await expect(page.locator('.save-bar-feedback')).toBeInViewport()
  await expect(page.getByLabel('Heure de début', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Titre (facultatif)', { exact: true })).toHaveValue('Force & conditionnement')
  await page.getByLabel('Heure de début', { exact: true }).fill('20:00')
  await page.getByLabel('Heure de fin', { exact: true }).fill('21:00')
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page).toHaveURL(/\/coach$/)
})

test('phone spotlight broadcasts the real TV with live clock, API updates and standby', async ({ page }) => {
  await page.clock.install({ time: new Date(`${today}T06:30:00+02:00`) })
  const state = await mock(page)
  await login(page)
  const screen = page.frameLocator('iframe[title="Vue TV en temps réel"]')
  await expect(screen.locator('.tv-session-title')).toContainText(state.items[0].title)
  await expect(screen.locator('.flip-clock')).toHaveAttribute('aria-label', 'Heure actuelle : 06:30')
  expect(await screen.locator('.tv-screen').evaluate(el => el.clientWidth)).toBe(1920)
  const frameWidth = await page.locator('.live-tv-viewport').evaluate(el => el.clientWidth)
  expect(frameWidth).toBeLessThan(390)
  await page.clock.fastForward(60000)
  await expect(screen.locator('.flip-clock')).toHaveAttribute('aria-label', 'Heure actuelle : 06:31')
  state.items[0].title = 'Programme actualisé en direct'
  await page.clock.fastForward(30000)
  await expect(screen.locator('.tv-session-title')).toHaveText('Programme actualisé en direct')
  state.tv = { current: null, next: null, remaining: [] }
  await page.clock.fastForward(30000)
  await expect(screen.getByRole('heading', { name: 'Aucune séance à venir' })).toBeVisible()
  await noOverflow(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(page.locator('.live-tv-embed')).toHaveCount(0)
  await expect(page.locator('.programme-brief-cards')).toBeVisible()
})

test('phone keeps the planning on the day and moves upcoming sessions to their own tab', async ({ page }) => {
  await page.clock.setFixedTime(new Date(`${today}T06:30:00+02:00`))
  await mock(page)
  await login(page)
  const tab = page.getByRole('link', { name: 'À venir', exact: true })
  const row = (title) => page.locator('.planning-row', { hasText: title })
  await expect(row('Prochaine programmation')).toBeHidden()
  await expect(row('WOD du soir')).toBeVisible()
  await tab.click()
  await expect(page).toHaveURL(/\/coach\/upcoming$/)
  await expect(page.getByRole('heading', { name: 'Prochaines séances', exact: true })).toHaveCount(1)
  await expect(page.getByRole('heading', { name: /Demain/ })).toBeVisible()
  await expect(row('Prochaine programmation')).toBeVisible()
  await expect(row('WOD du soir')).toHaveCount(0)
  await expect(tab).toHaveClass(/active/)
  await noOverflow(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/coach')
  await expect(tab).toBeHidden()
  await expect(row('Prochaine programmation')).toBeVisible()
})
