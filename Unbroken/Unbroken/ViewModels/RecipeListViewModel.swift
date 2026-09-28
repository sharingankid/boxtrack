import Foundation

enum RecipeListState: Equatable {
    case idle
    case loading
    case loaded([Recipe])
    case empty
    case error(String)
}

@MainActor
final class RecipeListViewModel: ObservableObject {
    @Published private(set) var state: RecipeListState = .idle
    @Published var searchText: String = "" {
        didSet { scheduleDebouncedSearch() }
    }

    private let service: RecipeServiceProtocol
    private let debounceNanoseconds: UInt64
    private var searchTask: Task<Void, Never>?

    init(service: RecipeServiceProtocol, debounceNanoseconds: UInt64 = 400_000_000) {
        self.service = service
        self.debounceNanoseconds = debounceNanoseconds
    }

    /// Triggers an immediate search (used for the initial load and retry).
    func search() {
        runSearch(query: searchText)
    }

    private func scheduleDebouncedSearch() {
        let query = searchText
        runSearch(query: query, debounced: true)
    }

    private func runSearch(query: String, debounced: Bool = false) {
        searchTask?.cancel()
        searchTask = Task {
            if debounced {
                try? await Task.sleep(nanoseconds: debounceNanoseconds)
                guard !Task.isCancelled else { return }
            }
            state = .loading
            do {
                let recipes = try await service.searchRecipes(query: query)
                guard !Task.isCancelled else { return }
                state = recipes.isEmpty ? .empty : .loaded(recipes)
            } catch {
                guard !Task.isCancelled else { return }
                state = .error((error as? LocalizedError)?.errorDescription ?? error.localizedDescription)
            }
        }
    }
}
