import XCTest
@testable import Unbroken

final class RecipeDecodingTests: XCTestCase {
    func testDecodesSpoonacularResponseIntoRecipes() throws {
        let json = """
        {
          "results": [
            {
              "id": 655812,
              "title": "Pasta and Seafood",
              "image": "https://img.spoonacular.com/recipes/655812-312x231.jpg",
              "dishTypes": ["lunch", "main course"],
              "nutrition": {
                "nutrients": [
                  { "name": "Calories", "amount": 538.82, "unit": "kcal" },
                  { "name": "Fat", "amount": 21.71, "unit": "g" }
                ]
              }
            }
          ]
        }
        """.data(using: .utf8)!

        let response = try JSONDecoder().decode(SpoonacularSearchResponse.self, from: json)
        let recipes = response.results.map(Recipe.init(dto:))

        XCTAssertEqual(recipes.count, 1)
        let recipe = try XCTUnwrap(recipes.first)
        XCTAssertEqual(recipe.id, 655812)
        XCTAssertEqual(recipe.name, "Pasta and Seafood")
        XCTAssertEqual(recipe.calorie, 539) // 538.82 rounded
        XCTAssertEqual(recipe.categories, [Categorie(name: "lunch"), Categorie(name: "main course")])
        XCTAssertEqual(recipe.imageURL, URL(string: "https://img.spoonacular.com/recipes/655812-312x231.jpg"))
    }

    func testMissingNutritionAndImageDefaultGracefully() throws {
        let json = """
        {
          "results": [
            { "id": 1, "title": "No Nutrition Info", "image": null, "dishTypes": [] }
          ]
        }
        """.data(using: .utf8)!

        let response = try JSONDecoder().decode(SpoonacularSearchResponse.self, from: json)
        let recipe = try XCTUnwrap(response.results.map(Recipe.init(dto:)).first)

        XCTAssertEqual(recipe.calorie, 0)
        XCTAssertTrue(recipe.categories.isEmpty)
        XCTAssertNil(recipe.imageURL)
    }
}
