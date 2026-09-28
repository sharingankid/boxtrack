import Foundation

final class RecipeService: RecipeServiceProtocol {
    private let baseURL = URL(string: "https://api.spoonacular.com/recipes/complexSearch")!
    private let session: URLSession
    private let apiKey: String?

    /// `apiKey` defaults to the value injected into Info.plist from
    /// `Config/Secrets.xcconfig` at build time (see `SpoonacularAPIKey`).
    init(
        session: URLSession = .shared,
        apiKey: String? = Bundle.main.object(forInfoDictionaryKey: "SpoonacularAPIKey") as? String
    ) {
        self.session = session
        self.apiKey = apiKey
    }

    func searchRecipes(query: String) async throws -> [Recipe] {
        guard let apiKey, !apiKey.isEmpty, !apiKey.hasPrefix("$(") else {
            throw APIError.missingAPIKey
        }

        guard var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: false) else {
            throw APIError.invalidURL
        }
        components.queryItems = [
            URLQueryItem(name: "apiKey", value: apiKey),
            URLQueryItem(name: "query", value: query),
            URLQueryItem(name: "addRecipeInformation", value: "true"),
            URLQueryItem(name: "addRecipeNutrition", value: "true"),
            URLQueryItem(name: "number", value: "20"),
        ]
        guard let url = components.url else {
            throw APIError.invalidURL
        }

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(from: url)
        } catch {
            throw APIError.network(error.localizedDescription)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        guard (200..<300).contains(httpResponse.statusCode) else {
            throw APIError.server(statusCode: httpResponse.statusCode)
        }

        do {
            let decoded = try JSONDecoder().decode(SpoonacularSearchResponse.self, from: data)
            return decoded.results.map(Recipe.init(dto:))
        } catch {
            throw APIError.decoding
        }
    }
}
