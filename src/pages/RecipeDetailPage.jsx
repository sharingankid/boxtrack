import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import StatePanel from '../components/StatePanel.jsx'
import { useRecipes } from '../state/RecipesContext.jsx'

export default function RecipeDetailPage() {
  const { id } = useParams()
  const { getRecipe } = useRecipes()
  const [recipe, setRecipe] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getRecipe(id).then((data) => {
      if (!active) return
      if (data) setRecipe(data)
      else setError('Cette recette est introuvable.')
    }).catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [getRecipe, id])

  if (error) return <div className="page wrap"><StatePanel type="error" title="Recette indisponible" message={error} action={<Link className="button primary" to="/recipes">Voir les recettes</Link>} /></div>
  if (!recipe) return <div className="page wrap"><StatePanel title="Chargement de la recette" message="Un instant…" /></div>

  return (
    <article className="page wrap recipe-detail">
      <Link className="back-link" to="/recipes">← Retour aux recettes</Link>
      <header className="session-heading">
        <div><p className="eyebrow">Recette</p><h1>{recipe.name}</h1></div>
        <span className="time-display">{recipe.calorie} kcal</span>
      </header>
      {recipe.image_url && <img className="recipe-detail-image" src={recipe.image_url} alt="" />}
      {recipe.categories?.length > 0 && (
        <ul className="recipe-tags">{recipe.categories.map((category) => <li key={category.name}>{category.name}</li>)}</ul>
      )}
      <section className="phase-card">
        <span className="phase-number">01</span>
        <p className="eyebrow">Composition</p>
        <h2>Ingrédients</h2>
        {recipe.ingredients?.length > 0
          ? <ol className="movement-list">{recipe.ingredients.map((ingredient, index) => (
              <li key={`${ingredient.name}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{ingredient.name}</strong><small>{ingredient.detail}</small></li>
            ))}</ol>
          : <p className="muted">Ingrédients non renseignés pour cette recette.</p>}
      </section>
    </article>
  )
}
