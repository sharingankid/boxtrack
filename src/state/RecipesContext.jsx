import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { cloneDemoRecipes, demoSpoonacularResults } from '../data/demoRecipes.js'
import { apiClient } from '../services/apiClient.js'
import { useAuth } from './AuthContext.jsx'

const RecipesContext = createContext(null)
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const asCategoryObjects = (categories = []) => categories.map((c) => (typeof c === 'string' ? { name: c } : c))

export function RecipesProvider({ children }) {
  const { mode, session: auth } = useAuth()
  const [recipes, setRecipes] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const demoIdRef = useRef(9100)

  const refresh = useCallback(async () => {
    setStatus('loading')
    setError('')
    try {
      const data = mode === 'demo' ? (await wait(250), cloneDemoRecipes()) : await apiClient.listRecipes()
      setRecipes(data)
      setStatus('ready')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }, [mode])

  useEffect(() => { refresh() }, [refresh])

  // Two parallel ways to populate the Recipes section: Spoonacular search
  // (this + save), or a coach typing a recipe in directly (save only).
  const search = useCallback(async (query) => {
    if (mode === 'demo') {
      await wait(250)
      const q = query.trim().toLowerCase()
      if (!q) return []
      return demoSpoonacularResults.filter((item) => item.name.toLowerCase().includes(q))
    }
    return apiClient.searchRecipes(query, auth?.token)
  }, [mode, auth])

  const save = async (data) => {
    if (mode === 'demo') {
      const saved = { ...data, id: demoIdRef.current++, categories: asCategoryObjects(data.categories) }
      setRecipes((current) => [saved, ...current])
      return saved
    }
    const saved = await apiClient.createRecipe(data, auth.token)
    await refresh()
    return saved
  }

  // Saving straight from a Spoonacular search result: ingredients aren't in
  // the search payload (see apiClient.searchRecipes), only the result's
  // demo/real ingredients carried alongside it at save time.
  const importFromSpoonacular = async (result) => {
    if (mode === 'demo') {
      const saved = { ...result, id: demoIdRef.current++, categories: asCategoryObjects(result.categories) }
      setRecipes((current) => [saved, ...current])
      return saved
    }
    const saved = await apiClient.importRecipe(result, auth.token)
    await refresh()
    return saved
  }

  const getRecipe = useCallback(async (id) => {
    const found = recipes.find((item) => String(item.id) === String(id))
    if (found) return found
    if (mode === 'demo') return undefined
    return apiClient.recipeDetail(id)
  }, [recipes, mode])

  const removeRecipe = async (id) => {
    if (mode === 'demo') {
      setRecipes((current) => current.filter((item) => String(item.id) !== String(id)))
      return
    }
    await apiClient.removeRecipe(id, auth.token)
    await refresh()
  }

  return (
    <RecipesContext.Provider value={{ recipes, status, error, refresh, search, save, importFromSpoonacular, getRecipe, removeRecipe, mode }}>
      {children}
    </RecipesContext.Provider>
  )
}

export const useRecipes = () => useContext(RecipesContext)
