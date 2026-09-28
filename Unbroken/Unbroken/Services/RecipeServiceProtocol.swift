import Foundation

/// Abstraction over recipe fetching so views/previews/tests can inject a
/// mock instead of hitting the real Spoonacular API.
protocol RecipeServiceProtocol {
    func searchRecipes(query: String) async throws -> [Recipe]
}
