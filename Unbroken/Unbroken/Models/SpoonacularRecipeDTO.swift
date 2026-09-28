import Foundation

/// Raw shapes returned by Spoonacular's `complexSearch` endpoint
/// (with `addRecipeInformation=true&addRecipeNutrition=true`).
/// Only the fields we actually map to `Recipe` are decoded.

struct SpoonacularSearchResponse: Decodable {
    let results: [SpoonacularRecipeDTO]
}

struct SpoonacularRecipeDTO: Decodable {
    let id: Int
    let title: String
    let image: String?
    let dishTypes: [String]?
    let nutrition: SpoonacularNutrition?
}

struct SpoonacularNutrition: Decodable {
    let nutrients: [SpoonacularNutrient]
}

struct SpoonacularNutrient: Decodable {
    let name: String
    let amount: Double
    let unit: String
}

extension Recipe {
    /// Maps a Spoonacular DTO to the team's `Recipe` model. `dishTypes`
    /// becomes `categories` (requires `addRecipeInformation=true`), and
    /// calories are read out of the nutrients list (requires
    /// `addRecipeNutrition=true`) — both flags are set by `RecipeService`.
    init(dto: SpoonacularRecipeDTO) {
        self.id = dto.id
        self.name = dto.title
        self.calorie = Self.calories(from: dto.nutrition)
        self.categories = (dto.dishTypes ?? []).map { Categorie(name: $0) }
        self.imageURL = dto.image.flatMap(URL.init(string:))
    }

    private static func calories(from nutrition: SpoonacularNutrition?) -> Int {
        guard let amount = nutrition?.nutrients.first(where: { $0.name == "Calories" })?.amount else {
            return 0
        }
        return Int(amount.rounded())
    }
}
