import { Link } from 'react-router-dom'

export default function RecipeCard({ recipe, action, to }) {
  const Title = to ? Link : 'h3'
  return (
    <article className="recipe-card">
      {recipe.image_url
        ? <img className="recipe-card-image" src={recipe.image_url} alt="" loading="lazy" />
        : <div className="recipe-card-image placeholder" aria-hidden="true" />}
      <div className="recipe-card-body">
        <div className="recipe-card-top">
          <Title {...(to ? { to } : {})}>{recipe.name}</Title>
          <span className="recipe-calories">{recipe.calorie} kcal</span>
        </div>
        {recipe.categories?.length > 0 && (
          <ul className="recipe-tags">
            {recipe.categories.map((category) => <li key={category.name}>{category.name}</li>)}
          </ul>
        )}
        {action}
      </div>
    </article>
  )
}
