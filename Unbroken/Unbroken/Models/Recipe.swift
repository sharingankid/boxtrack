import Foundation

/// Team-defined recipe model. Keep `name`/`calorie`/`categories` as-is —
/// `id`, `imageURL` and protocol conformances are the only additions.
struct Recipe: Identifiable, Codable, Hashable {
    var id: Int
    var name: String
    var calorie: Int
    var categories: [Categorie]
    var imageURL: URL?
}

struct Categorie: Codable, Hashable {
    var name: String
}
