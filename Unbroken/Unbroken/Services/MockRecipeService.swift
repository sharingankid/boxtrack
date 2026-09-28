import Foundation

/// In-memory RecipeServiceProtocol implementation for SwiftUI previews and
/// unit tests — no network involved.
struct MockRecipeService: RecipeServiceProtocol {
    var result: Result<[Recipe], Error>
    /// Optional artificial delay to exercise loading states in previews.
    var delayNanoseconds: UInt64 = 0

    func searchRecipes(query: String) async throws -> [Recipe] {
        if delayNanoseconds > 0 {
            try? await Task.sleep(nanoseconds: delayNanoseconds)
        }
        switch result {
        case .success(let recipes):
            if query.isEmpty { return recipes }
            return recipes.filter { $0.name.localizedCaseInsensitiveContains(query) }
        case .failure(let error):
            throw error
        }
    }
}

extension Recipe {
    static let mockSalmonBowl = Recipe(
        id: 1,
        name: "Grilled Salmon Bowl",
        calorie: 420,
        categories: [Categorie(name: "main course"), Categorie(name: "dinner")],
        imageURL: URL(string: "https://img.spoonacular.com/recipes/1-312x231.jpg")
    )

    static let mockVeggiePasta = Recipe(
        id: 2,
        name: "Veggie Pasta Primavera",
        calorie: 380,
        categories: [Categorie(name: "lunch")],
        imageURL: nil
    )

    static let mockChocolateCake = Recipe(
        id: 3,
        name: "Chocolate Lava Cake",
        calorie: 510,
        categories: [Categorie(name: "dessert")],
        imageURL: URL(string: "https://img.spoonacular.com/recipes/3-312x231.jpg")
    )

    static let mocks: [Recipe] = [.mockSalmonBowl, .mockVeggiePasta, .mockChocolateCake]
}
