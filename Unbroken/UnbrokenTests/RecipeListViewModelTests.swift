import XCTest
@testable import Unbroken

@MainActor
final class RecipeListViewModelTests: XCTestCase {
    func testSearchTransitionsToLoaded() async throws {
        let viewModel = RecipeListViewModel(service: MockRecipeService(result: .success(Recipe.mocks)))

        viewModel.search()
        try await Task.sleep(nanoseconds: 100_000_000)

        XCTAssertEqual(viewModel.state, .loaded(Recipe.mocks))
    }

    func testSearchWithNoResultsYieldsEmptyState() async throws {
        let viewModel = RecipeListViewModel(service: MockRecipeService(result: .success([])))

        viewModel.search()
        try await Task.sleep(nanoseconds: 100_000_000)

        XCTAssertEqual(viewModel.state, .empty)
    }

    func testSearchFailureYieldsErrorState() async throws {
        let failure = APIError.server(statusCode: 500)
        let viewModel = RecipeListViewModel(service: MockRecipeService(result: .failure(failure)))

        viewModel.search()
        try await Task.sleep(nanoseconds: 100_000_000)

        guard case .error(let message) = viewModel.state else {
            return XCTFail("Expected .error state, got \(viewModel.state)")
        }
        XCTAssertEqual(message, failure.errorDescription)
    }

    func testTypingSearchTextDebouncesAndFiltersResults() async throws {
        let viewModel = RecipeListViewModel(
            service: MockRecipeService(result: .success(Recipe.mocks)),
            debounceNanoseconds: 20_000_000
        )

        viewModel.search() // initial load, mirrors RecipeListView's .task on appear
        try await Task.sleep(nanoseconds: 100_000_000)

        viewModel.searchText = "salmon"
        try await Task.sleep(nanoseconds: 100_000_000)

        XCTAssertEqual(viewModel.state, .loaded([.mockSalmonBowl]))
    }
}
