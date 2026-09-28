import Foundation

enum APIError: Error, LocalizedError, Equatable {
    case missingAPIKey
    case invalidURL
    case invalidResponse
    case server(statusCode: Int)
    case decoding
    case network(String)

    var errorDescription: String? {
        switch self {
        case .missingAPIKey:
            return "Spoonacular API key is missing. Check Config/Secrets.xcconfig."
        case .invalidURL:
            return "Could not build the Spoonacular request URL."
        case .invalidResponse:
            return "The server returned an unexpected response."
        case .server(let statusCode):
            return "Spoonacular returned an error (status \(statusCode))."
        case .decoding:
            return "Could not parse the recipe data."
        case .network(let message):
            return "Network error: \(message)."
        }
    }
}
