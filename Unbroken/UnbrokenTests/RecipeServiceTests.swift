import XCTest
@testable import Unbroken

final class RecipeServiceTests: XCTestCase {
    func testMissingAPIKeyThrowsBeforeAnyRequest() async {
        let service = RecipeService(session: .shared, apiKey: nil)
        await assertThrowsMissingAPIKey(service)
    }

    func testEmptyAPIKeyThrowsBeforeAnyRequest() async {
        let service = RecipeService(session: .shared, apiKey: "")
        await assertThrowsMissingAPIKey(service)
    }

    func testUnsubstitutedPlaceholderThrowsBeforeAnyRequest() async {
        // Defensive case: an xcconfig variable Xcode couldn't resolve.
        let service = RecipeService(session: .shared, apiKey: "$(SPOONACULAR_API_KEY)")
        await assertThrowsMissingAPIKey(service)
    }

    private func assertThrowsMissingAPIKey(_ service: RecipeService) async {
        do {
            _ = try await service.searchRecipes(query: "pasta")
            XCTFail("Expected APIError.missingAPIKey")
        } catch let error as APIError {
            XCTAssertEqual(error, .missingAPIKey)
        } catch {
            XCTFail("Unexpected error type: \(error)")
        }
    }
}
