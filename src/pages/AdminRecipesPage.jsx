import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminHeader from '../components/AdminHeader.jsx'
import DemoBanner from '../components/DemoBanner.jsx'
import RecipeCard from '../components/RecipeCard.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { useRecipes } from '../state/RecipesContext.jsx'

const emptyManualForm = () => ({ name: '', calorie: '', image_url: '', categories: '' })

export default function AdminRecipesPage() {
  const { session: auth } = useAuth()
  const { recipes, status, search, save, removeRecipe, mode } = useRecipes()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [savingId, setSavingId] = useState(null)
  const [searchMessage, setSearchMessage] = useState('')

  const [manualForm, setManualForm] = useState(emptyManualForm)
  const [manualSaving, setManualSaving] = useState(false)
  const [manualMessage, setManualMessage] = useState('')

  if (!auth) return <Navigate to="/login" replace />

  const savedSpoonacularIds = new Set(recipes.map((item) => item.spoonacular_id).filter(Boolean))

  const runSearch = async (event) => {
    event.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setSearchMessage('')
    try {
      const data = await search(query)
      setResults(data)
      if (!data.length) setSearchMessage('Aucun résultat Spoonacular pour cette recherche.')
    } catch (err) {
      setSearchMessage(`Erreur : ${err.message}`)
    } finally {
      setSearching(false)
    }
  }

  const saveResult = async (result) => {
    setSavingId(result.spoonacular_id)
    try {
      await save(result)
    } catch (err) {
      setSearchMessage(`Erreur : ${err.message}`)
    } finally {
      setSavingId(null)
    }
  }

  const submitManual = async (event) => {
    event.preventDefault()
    setManualSaving(true)
    setManualMessage('')
    try {
      await save({
        name: manualForm.name,
        calorie: Number(manualForm.calorie),
        image_url: manualForm.image_url || null,
        categories: manualForm.categories.split(',').map((c) => c.trim()).filter(Boolean),
      })
      setManualForm(emptyManualForm())
      setManualMessage('Recette ajoutée.')
    } catch (err) {
      setManualMessage(`Erreur : ${err.message}`)
    } finally {
      setManualSaving(false)
    }
  }

  return (
    <div className="admin-shell">
      <DemoBanner />
      <AdminHeader active="recipes" />
      <main className="admin-main">
        <div className="admin-title">
          <div>
            <p className="eyebrow">Espace coach</p>
            <h1>Recettes</h1>
            <p>{mode === 'demo' ? 'Aperçu local non sécurisé — rien n’est envoyé au backend.' : 'Recherchez sur Spoonacular ou ajoutez une recette vous-même.'}</p>
          </div>
        </div>

        <section className="form-section">
          <div className="form-section-title"><span>01</span><div><p className="eyebrow">Spoonacular</p><h2>Rechercher une recette</h2></div></div>
          <form className="recipe-search-form" onSubmit={runSearch}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ex. chicken, salmon, protein pancakes…" aria-label="Recherche Spoonacular" />
            <button className="button primary" disabled={searching}>{searching ? 'Recherche…' : 'Rechercher'}</button>
          </form>
          {searchMessage && <p className="save-message" role="status">{searchMessage}</p>}
          {results.length > 0 && (
            <div className="recipe-grid compact">
              {results.map((result) => {
                const isSaved = savedSpoonacularIds.has(result.spoonacular_id)
                return (
                  <RecipeCard
                    key={result.spoonacular_id}
                    recipe={result}
                    action={
                      <button
                        type="button"
                        className="button ghost small"
                        disabled={isSaved || savingId === result.spoonacular_id}
                        onClick={() => saveResult(result)}
                      >
                        {isSaved ? 'Déjà enregistrée' : savingId === result.spoonacular_id ? 'Enregistrement…' : 'Enregistrer'}
                      </button>
                    }
                  />
                )
              })}
            </div>
          )}
        </section>

        <section className="form-section accent-section">
          <div className="form-section-title"><span>02</span><div><p className="eyebrow">Saisie manuelle</p><h2>Ajouter une recette</h2></div></div>
          <p className="muted">En parallèle de Spoonacular, vous pouvez intégrer vos propres recettes directement.</p>
          {manualMessage && <p className="save-message" role="status">{manualMessage}</p>}
          <form className="editor-form" onSubmit={submitManual}>
            <div className="two-cols">
              <label>Nom de la recette<input required value={manualForm.name} onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })} placeholder="Bowl post-training poulet-riz" /></label>
              <label>Calories<input required type="number" min="0" value={manualForm.calorie} onChange={(e) => setManualForm({ ...manualForm, calorie: e.target.value })} placeholder="520" /></label>
            </div>
            <label>Image (URL, optionnel)<input type="url" value={manualForm.image_url} onChange={(e) => setManualForm({ ...manualForm, image_url: e.target.value })} placeholder="https://…" /></label>
            <label>Catégories (séparées par des virgules, optionnel)<input value={manualForm.categories} onChange={(e) => setManualForm({ ...manualForm, categories: e.target.value })} placeholder="post-training, protéiné" /></label>
            <div className="form-actions"><button className="button primary" disabled={manualSaving}>{manualSaving ? 'Enregistrement…' : 'Ajouter la recette'}</button></div>
          </form>
        </section>

        <section className="form-section">
          <div className="form-section-title"><span>03</span><div><p className="eyebrow">Publiées</p><h2>Recettes enregistrées</h2></div></div>
          {status === 'loading' && <p className="muted">Chargement…</p>}
          {status === 'ready' && recipes.length === 0 && <p className="muted">Aucune recette enregistrée pour le moment.</p>}
          {recipes.length > 0 && (
            <div className="recipe-grid compact">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  action={<button type="button" className="icon-button" onClick={() => removeRecipe(recipe.id)} aria-label={`Supprimer ${recipe.name}`}>×</button>}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
