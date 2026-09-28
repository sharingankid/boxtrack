import SwiftUI

struct RecipeListView: View {
    @StateObject private var viewModel: RecipeListViewModel

    init(service: RecipeServiceProtocol = RecipeService()) {
        _viewModel = StateObject(wrappedValue: RecipeListViewModel(service: service))
    }

    var body: some View {
        NavigationStack {
            content
                .navigationTitle("Recipes")
                .background(Color.brandBackground)
                .searchable(text: $viewModel.searchText, prompt: "Search recipes")
                .task {
                    if case .idle = viewModel.state {
                        viewModel.search()
                    }
                }
        }
    }

    @ViewBuilder
    private var content: some View {
        switch viewModel.state {
        case .idle, .loading:
            ProgressView("Loading recipes…")
                .frame(maxWidth: .infinity, maxHeight: .infinity)

        case .loaded(let recipes):
            ScrollView {
                LazyVStack(spacing: DesignSystem.Spacing.md) {
                    ForEach(recipes) { recipe in
                        RecipeCardView(
                            name: recipe.name,
                            calorieText: "\(recipe.calorie) kcal",
                            categories: recipe.categories.map(\.name),
                            imageURL: recipe.imageURL
                        )
                    }
                }
                .padding(DesignSystem.Spacing.md)
            }

        case .empty:
            StatusMessageView(
                title: "No recipes found",
                message: "Try a different search term.",
                systemImage: "fork.knife"
            )

        case .error(let message):
            StatusMessageView(
                title: "Something went wrong",
                message: message,
                systemImage: "exclamationmark.triangle"
            ) {
                PrimaryButton(title: "Retry") { viewModel.search() }
                    .padding(.horizontal, DesignSystem.Spacing.xl)
            }
        }
    }
}

#Preview("Loaded") {
    RecipeListView(service: MockRecipeService(result: .success(Recipe.mocks)))
}

#Preview("Empty") {
    RecipeListView(service: MockRecipeService(result: .success([])))
}

#Preview("Error") {
    RecipeListView(service: MockRecipeService(result: .failure(APIError.server(statusCode: 500))))
}
