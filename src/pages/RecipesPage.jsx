import RecipeCard from '../components/RecipeCard.jsx'
import StatePanel from '../components/StatePanel.jsx'
import { useRecipes } from '../state/RecipesContext.jsx'

export default function RecipesPage() {
  const { recipes, status, error, refresh } = useRecipes()

  return (
    <section className="page wrap">
      <div className="page-heading">
        <p className="eyebrow">Cuisine</p>
        <h1>Recettes<br /><em>healthy & fit.</em></h1>
        <p>Une sélection de recettes pensées pour accompagner l’entraînement, choisie par les coachs de CrossFit LAB.</p>
      </div>
      {status === 'loading' && <StatePanel title="Chargement des recettes" message="On va chercher les fiches…" />}
      {status === 'error' && <StatePanel type="error" title="Recettes indisponibles" message={error} action={<button className="button primary" onClick={refresh}>Réessayer</button>} />}
      {status === 'ready' && recipes.length === 0 && <StatePanel type="empty" title="Pas encore de recette" message="Les coachs n’ont pas encore publié de recette." />}
      {status === 'ready' && recipes.length > 0 && (
        <div className="recipe-grid">
          {recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
        </div>
      )}
    </section>
  )
}
